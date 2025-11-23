/**
 * Integration Types
 * Types for external health data provider integrations
 */

/**
 * Supported external health data providers
 */
export enum HealthDataProvider {
  STRAVA = 'STRAVA',
  LOSE_IT = 'LOSE_IT',
  FITBIT = 'FITBIT',
}

/**
 * Integration status lifecycle
 */
export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  ERROR = 'ERROR',
}

/**
 * Standardized health data from external providers
 * All providers transform their data to this format
 */
export interface ExternalHealthData {
  date: Date;
  steps?: number;
  weight?: number;
  caloriesBurned?: number;
  exerciseMinutes?: number;
  sleepMinutes?: number;
  heartRate?: number;
  distance?: number; // in meters
  activeMinutes?: number;
  restingHeartRate?: number;
  provider: HealthDataProvider;
  rawData?: any; // Store original API response for debugging
}

/**
 * OAuth 2.0 credentials for external provider
 */
export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string; // Some providers don't provide refresh tokens
  expiresAt: Date;
  scope?: string; // OAuth scopes granted
  tokenType?: string; // Usually "Bearer"
}

/**
 * Data needed to create a new integration
 */
export interface CreateIntegrationData {
  userId: string;
  provider: HealthDataProvider;
  credentials: OAuthCredentials;
  status?: IntegrationStatus; // Defaults to ACTIVE
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Data that can be updated on an integration
 */
export interface UpdateIntegrationData {
  credentials?: OAuthCredentials;
  status?: IntegrationStatus;
  lastSyncedAt?: Date;
  syncErrorMessage?: string;
}

/**
 * Integration with provider details
 */
export interface IntegrationDetails {
  id: string;
  userId: string;
  provider: HealthDataProvider;
  status: IntegrationStatus;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  syncErrorMessage?: string;
  // Credentials excluded for security
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  integrationId: string;
  provider: HealthDataProvider;
  startDate: Date;
  endDate: Date;
  recordsSynced: number;
  recordsSkipped: number;
  errors: number;
  duration: number; // milliseconds
  errorMessages?: string[];
}

/**
 * Options for syncing data
 */
export interface SyncOptions {
  startDate?: Date; // Defaults to 7 days ago
  endDate?: Date; // Defaults to now
  forceResync?: boolean; // Re-sync data that already exists
}

/**
 * OAuth state for tracking authorization flow
 */
export interface OAuthState {
  userId: string;
  provider: HealthDataProvider;
  redirectUri: string;
  timestamp: number;
  nonce?: string; // Optional security token
}

/**
 * Authorization URL response
 */
export interface AuthorizationUrlResponse {
  authUrl: string;
  state: string; // Encoded OAuthState
  expiresAt: Date; // State expires after 10 minutes
}

/**
 * Helper to check if token is expired
 */
export function isTokenExpired(credentials: OAuthCredentials): boolean {
  return new Date() >= credentials.expiresAt;
}

/**
 * Helper to check if token expires soon (within 5 minutes)
 */
export function isTokenExpiringSoon(credentials: OAuthCredentials): boolean {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return fiveMinutesFromNow >= credentials.expiresAt;
}

/**
 * Helper to get provider display name
 */
export function getProviderDisplayName(provider: HealthDataProvider): string {
  const displayNames: Record<HealthDataProvider, string> = {
    [HealthDataProvider.STRAVA]: 'Strava',
    [HealthDataProvider.LOSE_IT]: 'Lose It!',
    [HealthDataProvider.FITBIT]: 'Fitbit',
  };
  return displayNames[provider];
}

/**
 * Helper to validate external health data
 */
export function validateExternalHealthData(data: ExternalHealthData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.date) {
    errors.push('Date is required');
  }

  if (data.steps !== undefined && (data.steps < 0 || data.steps > 100000)) {
    errors.push('Steps must be between 0 and 100,000');
  }

  if (data.weight !== undefined && (data.weight < 20 || data.weight > 500)) {
    errors.push('Weight must be between 20 and 500 kg');
  }

  if (
    data.caloriesBurned !== undefined &&
    (data.caloriesBurned < 0 || data.caloriesBurned > 20000)
  ) {
    errors.push('Calories burned must be between 0 and 20,000');
  }

  if (
    data.exerciseMinutes !== undefined &&
    (data.exerciseMinutes < 0 || data.exerciseMinutes > 1440)
  ) {
    errors.push('Exercise minutes must be between 0 and 1,440 (24 hours)');
  }

  if (
    data.heartRate !== undefined &&
    (data.heartRate < 30 || data.heartRate > 250)
  ) {
    errors.push('Heart rate must be between 30 and 250 bpm');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
