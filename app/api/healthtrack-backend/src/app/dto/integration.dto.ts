/**
 * Integration DTOs (Data Transfer Objects)
 *
 * These DTOs define the shape of data for HTTP requests/responses
 * and provide validation rules using class-validator decorators.
 *
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import {
  HealthDataProvider,
  IntegrationStatus,
} from '@core/types/integration.types';

/**
 * DTO for initiating OAuth connection
 */
export class InitiateConnectionDto {
  @ApiProperty({
    description: 'Health data provider to connect',
    enum: HealthDataProvider,
    example: HealthDataProvider.STRAVA,
  })
  @IsEnum(HealthDataProvider)
  @IsNotEmpty()
  provider: HealthDataProvider;
}

/**
 * Response DTO for OAuth authorization URL
 */
export class AuthorizationUrlResponseDto {
  @ApiProperty({
    description: 'OAuth authorization URL for user to visit',
    example: 'https://www.strava.com/oauth/authorize?client_id=...',
  })
  authUrl: string;

  @ApiProperty({
    description: 'Encoded state parameter for OAuth flow',
    example: 'eyJ1c2VySWQiOiIxMjMiLCJwcm92aWRlciI6IlNUUkFWQSJ9',
  })
  state: string;

  @ApiProperty({
    description: 'Expiration time for the state parameter',
    example: '2024-01-15T12:30:00Z',
  })
  expiresAt: Date;
}

/**
 * DTO for completing OAuth callback
 */
export class CompleteConnectionDto {
  @ApiProperty({
    description: 'Authorization code from OAuth provider',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'State parameter from OAuth flow',
    example: 'eyJ1c2VySWQiOiIxMjMiLCJwcm92aWRlciI6IlNUUkFWQSJ9',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}

/**
 * Response DTO for completed connection
 */
export class IntegrationResponseDto {
  @ApiProperty({
    description: 'Integration unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Health data provider',
    enum: HealthDataProvider,
    example: HealthDataProvider.STRAVA,
  })
  provider: HealthDataProvider;

  @ApiProperty({
    description: 'Integration status',
    enum: IntegrationStatus,
    example: IntegrationStatus.ACTIVE,
  })
  status: IntegrationStatus;

  @ApiPropertyOptional({
    description: 'Last sync timestamp',
    example: '2024-01-15T12:00:00Z',
  })
  lastSyncedAt?: Date;

  @ApiPropertyOptional({
    description: 'Error message if sync failed',
    example: 'API rate limit exceeded',
  })
  syncErrorMessage?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-10T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T12:00:00Z',
  })
  updatedAt: Date;
}

/**
 * DTO for sync options
 */
export class SyncDataDto {
  @ApiPropertyOptional({
    description: 'Start date for data sync (ISO format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for data sync (ISO format)',
    example: '2024-01-15T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Force re-sync of existing data',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  forceResync?: boolean;
}

/**
 * Response DTO for sync operation
 */
export class SyncResultDto {
  @ApiProperty({
    description: 'Integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  integrationId: string;

  @ApiProperty({
    description: 'Provider that was synced',
    enum: HealthDataProvider,
    example: HealthDataProvider.STRAVA,
  })
  provider: HealthDataProvider;

  @ApiProperty({
    description: 'Start date of sync range',
    example: '2024-01-01T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'End date of sync range',
    example: '2024-01-15T23:59:59Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Number of records successfully synced',
    example: 7,
  })
  recordsSynced: number;

  @ApiProperty({
    description: 'Number of records skipped (duplicates)',
    example: 2,
  })
  recordsSkipped: number;

  @ApiProperty({
    description: 'Number of errors encountered',
    example: 0,
  })
  errors: number;

  @ApiProperty({
    description: 'Sync duration in milliseconds',
    example: 2340,
  })
  duration: number;

  @ApiPropertyOptional({
    description: 'Error messages if any',
    type: [String],
    example: [],
  })
  errorMessages?: string[];
}

/**
 * Response DTO for list of integrations
 */
export class IntegrationListResponseDto {
  @ApiProperty({
    description: 'Array of user integrations',
    type: [IntegrationResponseDto],
  })
  integrations: IntegrationResponseDto[];

  @ApiProperty({
    description: 'Total count of integrations',
    example: 3,
  })
  total: number;
}

/**
 * Response DTO for successful disconnection
 */
export class DisconnectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Integration disconnected successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Disconnected integration ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  integrationId: string;
}

/**
 * Response DTO for batch sync
 */
export class BatchSyncResponseDto {
  @ApiProperty({
    description: 'Array of sync results',
    type: [SyncResultDto],
  })
  results: SyncResultDto[];

  @ApiProperty({
    description: 'Total integrations synced',
    example: 3,
  })
  totalSynced: number;

  @ApiProperty({
    description: 'Total integrations failed',
    example: 0,
  })
  totalFailed: number;
}

/**
 * DTO for provider info request
 */
export class GetProviderInfoDto {
  @ApiProperty({
    description: 'Health data provider',
    enum: HealthDataProvider,
    example: HealthDataProvider.STRAVA,
  })
  @IsEnum(HealthDataProvider)
  provider: HealthDataProvider;
}

/**
 * Response DTO for provider information
 */
export class ProviderInfoResponseDto {
  @ApiProperty({
    description: 'Provider name',
    example: 'Strava',
  })
  name: string;

  @ApiProperty({
    description: 'Provider description',
    example: 'Track your runs, rides, and workouts',
  })
  description: string;

  @ApiProperty({
    description: 'Data types provided',
    type: [String],
    example: ['Exercise', 'Heart Rate', 'Distance', 'Calories'],
  })
  dataTypes: string[];

  @ApiProperty({
    description: 'Whether this provider is currently supported',
    example: true,
  })
  isSupported: boolean;
}
