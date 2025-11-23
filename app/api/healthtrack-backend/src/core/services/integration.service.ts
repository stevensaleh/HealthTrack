/**
 * Integration Service
 * Core business logic for managing external health data provider integrations.
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import type { IIntegrationRepository } from '../repositories/integration.repository.interface';
import type { IHealthDataRepository } from '../repositories/health-data.repository.interface';
import type { IHealthDataProviderFactory } from '../providers/health-data-provider.interface';

import {
  HealthDataProvider,
  IntegrationStatus,
  SyncOptions,
  SyncResult,
  OAuthState,
  isTokenExpired,
  isTokenExpiringSoon,
  validateExternalHealthData,
} from '../types/integration.types';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    @Inject('IIntegrationRepository')
    private readonly integrationRepo: IIntegrationRepository,

    @Inject('IHealthDataRepository')
    private readonly healthDataRepo: IHealthDataRepository,

    @Inject('IHealthDataProviderFactory')
    private readonly providerFactory: IHealthDataProviderFactory,
  ) {}

  /**
   * Step 1: Initiate OAuth authorization flow
   *
   * Generate authorization URL for user to grant access to their
   * external health data.
   *
   * @param userId - User initiating connection
   * @param provider - Provider to connect
   * @returns Authorization URL for user to visit
   */
  async initiateConnection(
    userId: string,
    provider: HealthDataProvider,
  ): Promise<{ authUrl: string; state: string }> {
    this.logger.log(`Initiating ${provider} connection for user ${userId}`);

    // Check if user already has this provider connected
    const existing = await this.integrationRepo.findByUserIdAndProvider(
      userId,
      provider,
    );

    if (existing && existing.isActive) {
      throw new ConflictException(
        `Already connected to ${provider}. Disconnect first to reconnect.`,
      );
    }

    // Get appropriate provider adapter
    const adapter = this.providerFactory.getProvider(provider);

    // Create state with user context
    const state: OAuthState = {
      userId,
      provider,
      redirectUri: process.env.OAUTH_REDIRECT_URI || '',
      timestamp: Date.now(),
      nonce: this.generateNonce(),
    };

    // Encode state as base64
    const encodedState = Buffer.from(JSON.stringify(state)).toString('base64');

    // Get authorization URL from adapter
    const response = await adapter.getAuthorizationUrl(encodedState);

    this.logger.log(`Generated auth URL for ${provider}`);

    return {
      authUrl: response.authUrl,
      state: encodedState,
    };
  }

  /**
   * Step 2: Complete OAuth flow and save integration
   *
   * After user authorizes, provider redirects to our callback with
   * authorization code. We exchange code for access token and save integration.
   *
   * @param code - Authorization code from provider
   * @param state - Encoded state from step 1
   * @returns Created integration
   */
  async completeConnection(
    code: string,
    state: string,
  ): Promise<{ id: string; provider: HealthDataProvider; status: string }> {
    this.logger.log('Completing OAuth connection');

    // Decode and validate state
    const oauthState = this.decodeAndValidateState(state);

    // Get provider adapter
    const adapter = this.providerFactory.getProvider(oauthState.provider);

    try {
      // Exchange authorization code for access token
      const credentials = await adapter.exchangeCodeForToken(code);

      this.logger.log(
        `Successfully exchanged code for ${oauthState.provider} token`,
      );

      // Check if integration already exists
      const existing = await this.integrationRepo.findByUserIdAndProvider(
        oauthState.userId,
        oauthState.provider,
      );

      let integration;

      if (existing) {
        // Update existing integration with new credentials
        this.logger.log(`Updating existing ${oauthState.provider} integration`);
        integration = await this.integrationRepo.updateCredentials(
          existing.id,
          credentials,
        );
        // Reset status to ACTIVE
        integration = await this.integrationRepo.updateStatus(
          integration.id,
          IntegrationStatus.ACTIVE,
        );
      } else {
        // Create new integration
        this.logger.log(`Creating new ${oauthState.provider} integration`);
        integration = await this.integrationRepo.create({
          userId: oauthState.userId,
          provider: oauthState.provider,
          credentials,
          status: IntegrationStatus.ACTIVE,
        });
      }

      return {
        id: integration.id,
        provider: integration.provider as HealthDataProvider,
        status: integration.isActive ? IntegrationStatus.ACTIVE : IntegrationStatus.EXPIRED,
      };
    } catch (error) {
      this.logger.error(
        `Failed to complete ${oauthState.provider} connection: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to complete authorization: ${error.message}`,
      );
    }
  }

  /**
   * Sync health data from external provider
   *
   * @param integrationId - Integration to sync
   * @param options - Sync options (date range, force resync)
   * @returns Sync result with counts and errors
   */
  async syncHealthData(
    integrationId: string,
    options: SyncOptions = {},
  ): Promise<SyncResult> {
    const startTime = Date.now();

    this.logger.log(`Starting sync for integration ${integrationId}`);

    // Get integration
    const integration = await this.integrationRepo.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Validate integration status
    if (!integration.isActive) {
      throw new BadRequestException(
        'Integration is not active. Please reconnect.',
      );
    }

    // Get provider adapter
    const adapter = this.providerFactory.getProvider(
      integration.provider as HealthDataProvider,
    );

    // Default date range: last 7 days
    const startDate =
      options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate || new Date();

    let credentials = integration.credentials as any;

    try {
      // Refresh token if expired or expiring soon
      if (isTokenExpired(credentials) || isTokenExpiringSoon(credentials)) {
        this.logger.log('Token expired or expiring, refreshing...');

        if (!credentials.refreshToken) {
          // No refresh token available, mark as inactive
          throw new UnauthorizedException(
            'Token expired and no refresh token available. Please reconnect.',
          );
        }

        credentials = await adapter.refreshAccessToken(
          credentials.refreshToken,
        );

        // Save refreshed credentials
        await this.integrationRepo.updateCredentials(
          integration.id,
          credentials,
        );

        this.logger.log('Token refreshed successfully');
      }

      // Fetch health data from external API
      this.logger.log(
        `Fetching data from ${integration.provider}: ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );

      const externalData = await adapter.fetchHealthData(
        credentials,
        startDate,
        endDate,
      );

      this.logger.log(
        `Fetched ${externalData.length} records from ${integration.provider}`,
      );

      // Transform and save to our database
      let synced = 0;
      let skipped = 0;
      let errors = 0;
      const errorMessages: string[] = [];

      for (const data of externalData) {
        try {
          // Validate data
          const validation = validateExternalHealthData(data);
          if (!validation.valid) {
            this.logger.warn(
              `Invalid data from ${integration.provider}: ${validation.errors.join(', ')}`,
            );
            errors++;
            errorMessages.push(...validation.errors);
            continue;
          }

          // Check if data already exists (unless force resync)
          if (!options.forceResync) {
            const existing = await this.healthDataRepo.findByUserAndDate(
              integration.userId,
              data.date,
            );

            if (existing) {
              skipped++;
              continue;
            }
          }

          // Save to database
          await this.healthDataRepo.create({
            userId: integration.userId,
            date: data.date,
            steps: data.steps,
            weight: data.weight,
            caloriesBurned: data.caloriesBurned,
            exerciseMinutes: data.exerciseMinutes,
            sleepMinutes: data.sleepMinutes,
            heartRate: data.heartRate,
            distance: data.distance,
            source: integration.provider,
          });

          synced++;
        } catch (error) {
          this.logger.error(`Error saving health data: ${error.message}`);
          errors++;
          errorMessages.push(error.message);
        }
      }

      // Update last synced timestamp
      await this.integrationRepo.updateLastSynced(integration.id);

      // Clear any previous error status
      if (integration.status === IntegrationStatus.ERROR) {
        await this.integrationRepo.updateStatus(
          integration.id,
          IntegrationStatus.ACTIVE,
        );
      }

      // Clear any previous error status
      if (integration.syncErrorMessage) {
        await this.integrationRepo.recordSyncError(integration.id, null);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors in ${duration}ms`,
      );

      return {
        integrationId: integration.id,
        provider: integration.provider as HealthDataProvider,
        startDate,
        endDate,
        recordsSynced: synced,
        recordsSkipped: skipped,
        errors,
        duration,
        errorMessages: errorMessages.length > 0 ? errorMessages : undefined,
      };
    } catch (error) {
      this.logger.error(`Sync failed: ${error.message}`, error.stack);

      // Record error in database
      await this.integrationRepo.recordSyncError(integration.id, error.message);

      throw error;
    }
  }

  /**
   * Get all integrations for a user
   *
   * @param userId - User ID
   * @returns Array of integrations (without sensitive credentials)
   */
  async getUserIntegrations(userId: string) {
    const integrations = await this.integrationRepo.findByUserId(userId);

    // Remove sensitive credentials from response
    return integrations.map((integration) => ({
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
      lastSyncedAt: integration.lastSyncedAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
      syncErrorMessage: integration.syncErrorMessage,
    }));
  }

  /**
   * Get active integrations for a user
   *
   * @param userId - User ID
   * @returns Array of active integrations
   */
  async getActiveIntegrations(userId: string) {
    const integrations = await this.integrationRepo.findActiveByUserId(userId);

    return integrations.map((integration) => ({
      id: integration.id,
      provider: integration.provider,
      lastSyncedAt: integration.lastSyncedAt,
    }));
  }

  /**
   * Disconnect integration
   *
   * Revokes access on provider's side and deletes integration
   *
   * @param integrationId - Integration to disconnect
   * @param userId - User requesting disconnect (for authorization)
   */
  async disconnectIntegration(
    integrationId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(`Disconnecting integration ${integrationId}`);

    const integration = await this.integrationRepo.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Verify user owns this integration
    if (integration.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to disconnect this integration',
      );
    }

    const adapter = this.providerFactory.getProvider(
      integration.provider as HealthDataProvider,
    );

    try {
      // Revoke access on provider's side
      await adapter.revokeAccess(integration.credentials as any);
      this.logger.log(`Revoked access for ${integration.provider}`);
    } catch (error) {
      // Log but don't fail - we'll delete locally anyway
      this.logger.warn(
        `Failed to revoke access on provider side: ${error.message}`,
      );
    }

    // Delete integration from our database
    await this.integrationRepo.delete(integration.id);

    this.logger.log(`Integration ${integrationId} disconnected successfully`);
  }

  /**
   * Batch sync all active integrations for a user
   *
   * @param userId - User ID
   * @returns Array of sync results
   */
  async syncAllIntegrations(userId: string): Promise<SyncResult[]> {
    const integrations = await this.integrationRepo.findActiveByUserId(userId);

    this.logger.log(
      `Syncing ${integrations.length} integrations for user ${userId}`,
    );

    const results: SyncResult[] = [];

    for (const integration of integrations) {
      try {
        const result = await this.syncHealthData(integration.id);
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to sync ${integration.provider}: ${error.message}`,
        );
        // Continue syncing other integrations
      }
    }

    return results;
  }

  /**
   * Helper: Decode and validate OAuth state
   */
  private decodeAndValidateState(encodedState: string): OAuthState {
    try {
      const decoded = Buffer.from(encodedState, 'base64').toString('utf-8');
      const state: OAuthState = JSON.parse(decoded);

      // Validate timestamp (state expires after 10 minutes)
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      if (state.timestamp < tenMinutesAgo) {
        throw new Error('OAuth state expired');
      }

      return state;
    } catch (error) {
      throw new BadRequestException('Invalid OAuth state');
    }
  }

  /**
   * Helper: Generate random nonce for security
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
