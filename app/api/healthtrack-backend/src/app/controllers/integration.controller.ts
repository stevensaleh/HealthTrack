/**
 * Integration Controller
 *
 * Handles HTTP requests for external health data integrations.
 *
 * Endpoints:
 * - POST   /integrations/connect          - Initiate OAuth connection
 * - POST   /integrations/callback         - Complete OAuth flow
 * - POST   /integrations/:id/sync         - Sync data from provider
 * - POST   /integrations/sync-all         - Sync all active integrations
 * - GET    /integrations                  - Get user's integrations
 * - GET    /integrations/:id              - Get specific integration
 * - DELETE /integrations/:id              - Disconnect integration
 * - GET    /integrations/providers/info   - Get provider information
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { IntegrationService } from '@core/services/integration.service';
import { HealthDataProviderFactory } from '@infra/factories/health-data-provider.factory';

import {
  InitiateConnectionDto,
  AuthorizationUrlResponseDto,
  CompleteConnectionDto,
  IntegrationResponseDto,
  IntegrationListResponseDto,
  SyncDataDto,
  SyncResultDto,
  DisconnectResponseDto,
  BatchSyncResponseDto,
  GetProviderInfoDto,
  ProviderInfoResponseDto,
} from '../dto/integration.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly providerFactory: HealthDataProviderFactory,
  ) {}

  /**
   * Initiate OAuth connection to a health data provider
   *
   * Returns authorization URL for user to visit
   */
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate OAuth connection',
    description:
      'Generate authorization URL for connecting to a health data provider',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL generated successfully',
    type: AuthorizationUrlResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Integration already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async initiateConnection(
    @Body() dto: InitiateConnectionDto,
    @Request() req: any,
  ): Promise<AuthorizationUrlResponseDto> {
    this.logger.log(
      `User ${req.user.id} initiating connection to ${dto.provider}`,
    );

    const result = await this.integrationService.initiateConnection(
      req.user.id,
      dto.provider,
    );

    return {
      authUrl: result.authUrl,
      state: result.state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  }

  /**
   * Complete OAuth flow (callback endpoint)
   *
   * Called by frontend after user authorizes on provider's site
   */
  @Post('callback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Complete OAuth connection',
    description:
      'Exchange authorization code for access token and save integration',
  })
  @ApiResponse({
    status: 201,
    description: 'Integration created successfully',
    type: IntegrationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid authorization code or state',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeConnection(
    @Body() dto: CompleteConnectionDto,
  ): Promise<IntegrationResponseDto> {
    this.logger.log('Completing OAuth connection');

    const result = await this.integrationService.completeConnection(
      dto.code,
      dto.state,
    );

    return {
      id: result.id,
      provider: result.provider,
      status: result.status as any,
      lastSyncedAt: undefined,
      syncErrorMessage: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get all integrations for the authenticated user
   */
  @Get()
  @ApiOperation({
    summary: 'Get user integrations',
    description:
      'Retrieve all health data integrations for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Integrations retrieved successfully',
    type: IntegrationListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserIntegrations(
    @Request() req: any,
  ): Promise<IntegrationListResponseDto> {
    this.logger.log(`Getting integrations for user ${req.user.id}`);

    const integrations = await this.integrationService.getUserIntegrations(
      req.user.id,
    );

    return {
      integrations: integrations as any,
      total: integrations.length,
    };
  }

  /**
   * Get specific integration by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get integration by ID',
    description: 'Retrieve details of a specific integration',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration retrieved successfully',
    type: IntegrationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getIntegration(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<IntegrationResponseDto> {
    this.logger.log(`Getting integration ${id} for user ${req.user.id}`);

    const integrations = await this.integrationService.getUserIntegrations(
      req.user.id,
    );

    const integration = integrations.find((i) => i.id === id);

    if (!integration) {
      throw new BadRequestException('Integration not found');
    }

    return integration as any;
  }

  /**
   * Sync health data from a specific integration
   */
  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync health data',
    description: 'Trigger data synchronization from external health provider',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data synced successfully',
    type: SyncResultDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Integration is not active or token expired',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async syncData(
    @Param('id') id: string,
    @Body() dto: SyncDataDto,
  ): Promise<SyncResultDto> {
    this.logger.log(`Syncing data for integration ${id}`);

    const options = {
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      forceResync: dto.forceResync || false,
    };

    const result = await this.integrationService.syncHealthData(id, options);

    return result as any;
  }

  /**
   * Sync all active integrations for the user
   */
  @Post('sync-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync all integrations',
    description: 'Trigger data synchronization for all active integrations',
  })
  @ApiResponse({
    status: 200,
    description: 'All integrations synced',
    type: BatchSyncResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async syncAllIntegrations(
    @Request() req: any,
  ): Promise<BatchSyncResponseDto> {
    this.logger.log(`Syncing all integrations for user ${req.user.id}`);

    const results = await this.integrationService.syncAllIntegrations(
      req.user.id,
    );

    const totalFailed = results.filter((r) => r.errors > 0).length;

    return {
      results: results as any,
      totalSynced: results.length - totalFailed,
      totalFailed,
    };
  }

  /**
   * Disconnect an integration
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect integration',
    description: 'Revoke access and delete an integration',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration disconnected successfully',
    type: DisconnectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not own this integration',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async disconnectIntegration(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<DisconnectResponseDto> {
    this.logger.log(`Disconnecting integration ${id} for user ${req.user.id}`);

    await this.integrationService.disconnectIntegration(id, req.user.id);

    return {
      message: 'Integration disconnected successfully',
      integrationId: id,
    };
  }

  /**
   * Get information about available providers
   */
  @Get('providers/info')
  @ApiOperation({
    summary: 'Get provider information',
    description: 'Get details about supported health data providers',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    enum: ['STRAVA', 'LOSE_IT', 'FITBIT'],
    description: 'Specific provider to get info for',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider information retrieved',
    type: [ProviderInfoResponseDto],
  })
  async getProviderInfo(
    @Query('provider') provider?: string,
  ): Promise<ProviderInfoResponseDto | ProviderInfoResponseDto[]> {
    this.logger.log('Getting provider information');

    if (provider) {
      // Get info for specific provider
      const info = this.providerFactory.getProviderInfo(provider as any);
      return {
        ...info,
        isSupported: this.providerFactory.isProviderSupported(provider as any),
      };
    }

    // Get info for all providers
    const providers = this.providerFactory.getSupportedProviders();
    return providers.map((p) => ({
      ...this.providerFactory.getProviderInfo(p),
      isSupported: true,
    }));
  }
}
