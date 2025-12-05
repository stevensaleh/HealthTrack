/**
 * Integration Repository Interface
 * Defines contract for persisting and retrieving integration data
 */

import { Integration } from '@prisma/client';
import {
  CreateIntegrationData,
  UpdateIntegrationData,
  IntegrationStatus,
  HealthDataProvider,
  OAuthCredentials,
} from '../types/integration.types';

export interface IIntegrationRepository {
  /**
   * Find integration by ID
   *
   * @param id - Integration unique identifier
   * @returns Integration or null if not found
   */
  findById(id: string): Promise<Integration | null>;

  /**
   * Find all integrations for a user
   *
   * Used to display user's connected providers
   *
   * @param userId - User unique identifier
   * @returns Array of user's integrations
   */
  findByUserId(userId: string): Promise<Integration[]>;

  /**
   * Find integration by user and provider type
   *
   * Used to check if user already has this provider connected
   * (prevents duplicate integrations)
   *
   * @param userId - User unique identifier
   * @param provider - Provider type
   * @returns Integration or null if not found
   */
  findByUserIdAndProvider(
    userId: string,
    provider: HealthDataProvider,
  ): Promise<Integration | null>;

  /**
   * Find only active integrations for a user
   *
   * Used for automatic syncing (cron jobs)
   * Only sync integrations in ACTIVE status
   *
   * @param userId - User unique identifier
   * @returns Array of active integrations
   */
  findActiveByUserId(userId: string): Promise<Integration[]>;

  /**
   * Find integrations that need token refresh
   *
   * Query for integrations where token expires soon
   * Used by background job to proactively refresh tokens
   *
   * @param thresholdMinutes - Refresh if expires within this many minutes
   * @returns Array of integrations needing refresh
   */
  findIntegrationsNeedingRefresh(
    thresholdMinutes: number,
  ): Promise<Integration[]>;

  /**
   * Create new integration
   *
   * @param data - Integration creation data
   * @returns Created integration
   * @throws ConflictException if integration already exists for user+provider
   */
  create(data: CreateIntegrationData): Promise<Integration>;

  /**
   * Update integration fields
   *
   * Generic update for any fields
   *
   * @param id - Integration ID
   * @param data - Fields to update
   * @returns Updated integration
   * @throws NotFoundException if integration not found
   */
  update(id: string, data: UpdateIntegrationData): Promise<Integration>;

  /**
   * Update OAuth credentials
   *
   * Specialized update for refreshing tokens
   *
   * @param id - Integration ID
   * @param credentials - New OAuth credentials
   * @returns Updated integration
   * @throws NotFoundException if integration not found
   */
  updateCredentials(
    id: string,
    credentials: OAuthCredentials,
  ): Promise<Integration>;

  /**
   * Update integration status
   *
   * Specialized update for status changes
   * (ACTIVE → ERROR, EXPIRED → ACTIVE, etc.)
   *
   * @param id - Integration ID
   * @param status - New status
   * @returns Updated integration
   * @throws NotFoundException if integration not found
   */
  updateStatus(id: string, status: IntegrationStatus): Promise<Integration>;

  /**
   * Update last synced timestamp
   *
   * Called after successful sync to track when data was last pulled
   *
   * @param id - Integration ID
   * @param timestamp - Sync timestamp (defaults to now)
   * @returns Updated integration
   */
  updateLastSynced(id: string, timestamp?: Date): Promise<Integration>;

  /**
   * Record sync error
   *
   * Store error message and update status to ERROR
   *
   * @param id - Integration ID
   * @param errorMessage - Error description
   * @returns Updated integration
   */
  recordSyncError(id: string, errorMessage: string): Promise<Integration>;

  /**
   * Delete integration
   *
   * Permanently remove integration
   * Called when user disconnects provider
   *
   * @param id - Integration ID
   * @throws NotFoundException if integration not found
   */
  delete(id: string): Promise<void>;

  /**
   * Check if user has active integration with provider
   *
   * Quick existence check without returning full object
   *
   * @param userId - User ID
   * @param provider - Provider type
   * @returns true if active integration exists
   */
  hasActiveIntegration(
    userId: string,
    provider: HealthDataProvider,
  ): Promise<boolean>;

  /**
   * Get integration count by provider
   *
   * Analytics: How many users connected each provider?
   *
   * @returns Map of provider → count
   */
  getIntegrationCountByProvider(): Promise<Record<HealthDataProvider, number>>;

  /**
   * Get integrations for batch sync
   *
   * Used by cron job to get integrations that need syncing
   *
   * @param lastSyncedBefore - Only include if last synced before this time
   * @param limit - Maximum number to return
   * @returns Array of integrations
   */
  findForBatchSync(
    lastSyncedBefore: Date,
    limit: number,
  ): Promise<Integration[]>;
}
