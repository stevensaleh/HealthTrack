/**
 * Health Data Provider Interface (PORT)
 *
 * This interface defines the contract that all external health data
 * provider adapters must implement (Google Fit, Fitbit, Apple Health, etc.)
 */

import {
  HealthDataProvider,
  OAuthCredentials,
  ExternalHealthData,
  AuthorizationUrlResponse,
} from '../types/integration.types';

export interface IHealthDataProvider {
  /**
   * Get the provider identifier
   * @returns The provider enum value
   */
  getProviderName(): HealthDataProvider;

  /**
   * Generate OAuth authorization URL for user to grant access
   *
   * @param state - Encoded state containing userId and other metadata
   * @returns Authorization URL response with URL and state
   */
  getAuthorizationUrl(state: string): Promise<AuthorizationUrlResponse>;

  /**
   * Exchange authorization code for access token
   *
   * After user authorizes, provider redirects back with a code.
   * We exchange this code for an access token to make API requests.
   *
   * @param code - Authorization code from OAuth callback
   * @returns OAuth credentials (access token, refresh token, expiry)
   */
  exchangeCodeForToken(code: string): Promise<OAuthCredentials>;

  /**
   * Fetch health data from external API
   *
   * This is the core data sync method. Each provider transforms
   * their specific API response into our standard ExternalHealthData format.
   *
   * @param credentials - OAuth credentials to authenticate API requests
   * @param startDate - Start of date range to fetch
   * @param endDate - End of date range to fetch
   * @returns Array of standardized health data
   * @throws UnauthorizedException if token is invalid
   * @throws ExternalServiceException if provider API fails
   */
  fetchHealthData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalHealthData[]>;

  /**
   * Refresh expired access token
   *
   * @param refreshToken - Refresh token from original authorization
   * @returns New OAuth credentials with fresh access token
   * @throws UnauthorizedException if refresh token is invalid/revoked
   */
  refreshAccessToken(refreshToken: string): Promise<OAuthCredentials>;

  /**
   * Revoke access and disconnect integration
   *
   * When user wants to disconnect, we should revoke the token
   * on the provider's side for security.
   *
   * @param credentials - Credentials to revoke
   * @throws ExternalServiceException if revocation fails (log but continue)
   */
  revokeAccess(credentials: OAuthCredentials): Promise<void>;

  /**
   * Validate that credentials are still valid
   *
   * @param credentials - Credentials to validate
   * @returns true if valid, false if invalid/expired
   */
  validateCredentials?(credentials: OAuthCredentials): Promise<boolean>;

  /**
   * Get available scopes/permissions for this provider
   * @returns Array of scope identifiers with descriptions
   */
  getAvailableScopes?(): Promise<Array<{ scope: string; description: string }>>;
}

/**
 * Factory interface for creating health data providers
 *
 */
export interface IHealthDataProviderFactory {
  /**
   * Get appropriate provider adapter based on type
   *
   * @param provider - Type of provider needed
   * @returns Concrete implementation of IHealthDataProvider
   * @throws Error if provider is not supported
   */
  getProvider(provider: HealthDataProvider): IHealthDataProvider;

  /**
   * Get all supported providers
   * @returns Array of supported provider types
   */
  getSupportedProviders(): HealthDataProvider[];

  /**
   * Check if a provider is supported
   *
   * @param provider - Provider to check
   * @returns true if supported, false otherwise
   */
  isProviderSupported(provider: HealthDataProvider): boolean;
}
