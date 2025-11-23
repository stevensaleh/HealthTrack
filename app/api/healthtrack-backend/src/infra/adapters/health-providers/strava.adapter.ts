/**
 * Strava API Adapter
 *
 * Implements IHealthDataProvider for Strava sports/exercise tracking API.
 *
 * Strava provides:
 * - Activities (runs, rides, swims, hikes, etc.)
 * - Exercise duration and distance
 * - Heart rate data
 * - Calories burned
 *
 * API Documentation: https://developers.strava.com/docs/reference
 * OAuth 2.0 with standard flow
 * Rate Limit: 200 requests/15 minutes, 2000 requests/day
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import { IHealthDataProvider } from '@core/providers/health-data-provider.interface';
import {
  HealthDataProvider,
  OAuthCredentials,
  ExternalHealthData,
  AuthorizationUrlResponse,
} from '@core/types/integration.types';

@Injectable()
export class StravaAdapter implements IHealthDataProvider {
  private readonly logger = new Logger(StravaAdapter.name);
  private readonly client: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  // Strava API endpoints
  private readonly BASE_URL = 'https://www.strava.com/api/v3';
  private readonly AUTH_URL = 'https://www.strava.com/oauth/authorize';
  private readonly TOKEN_URL = 'https://www.strava.com/oauth/token';

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('STRAVA_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('STRAVA_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('OAUTH_REDIRECT_URI');

    // Create axios instance
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
      },
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Strava API Error: ${error.message}`);
        if (error.response) {
          this.logger.error(`Status: ${error.response.status}`);
          this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      },
    );
  }

  getProviderName(): HealthDataProvider {
    return HealthDataProvider.STRAVA;
  }

  async getAuthorizationUrl(state: string): Promise<AuthorizationUrlResponse> {
    this.logger.log('Generating Strava authorization URL');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'activity:read_all,profile:read_all',
      state: state,
      approval_prompt: 'auto', // or 'force' to always show consent
    });

    const authUrl = `${this.AUTH_URL}?${params.toString()}`;

    return {
      authUrl,
      state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
  }

  async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    this.logger.log('Exchanging authorization code for Strava token');

    try {
      const response = await axios.post(this.TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
      });

      const { access_token, refresh_token, expires_at } = response.data;

      this.logger.log('Successfully obtained Strava access token');

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(expires_at * 1000), // Strava returns Unix timestamp
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to exchange Strava authorization code');
      throw new Error(`Strava token exchange failed: ${error.message}`);
    }
  }

  async fetchHealthData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalHealthData[]> {
    this.logger.log(
      `Fetching Strava activities from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    try {
      // Convert dates to Unix timestamps (Strava uses seconds)
      const after = Math.floor(startDate.getTime() / 1000);
      const before = Math.floor(endDate.getTime() / 1000);

      // Fetch activities
      const response = await this.client.get('/athlete/activities', {
        params: {
          before: before,
          after: after,
          per_page: 200, // Max allowed by Strava
        },
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      const activities = response.data;

      this.logger.log(`Fetched ${activities.length} activities from Strava`);

      // Transform Strava activities to our standard format
      const healthData: ExternalHealthData[] = [];

      // Group activities by date
      const activitiesByDate = new Map<string, any[]>();

      activities.forEach((activity) => {
        const date = activity.start_date.split('T')[0]; // Get date part
        if (!activitiesByDate.has(date)) {
          activitiesByDate.set(date, []);
        }
        activitiesByDate.get(date).push(activity);
      });

      // Aggregate activities per day
      activitiesByDate.forEach((dayActivities, dateStr) => {
        const totalMinutes = dayActivities.reduce(
          (sum, act) => sum + Math.round(act.moving_time / 60),
          0,
        );
        const totalCalories = dayActivities.reduce(
          (sum, act) => sum + (act.calories || 0),
          0,
        );
        const totalDistance = dayActivities.reduce(
          (sum, act) => sum + (act.distance || 0),
          0,
        );

        // Average heart rate (if available)
        const activitiesWithHR = dayActivities.filter(
          (act) => act.has_heartrate && act.average_heartrate,
        );
        const avgHeartRate =
          activitiesWithHR.length > 0
            ? Math.round(
                activitiesWithHR.reduce(
                  (sum, act) => sum + act.average_heartrate,
                  0,
                ) / activitiesWithHR.length,
              )
            : undefined;

        healthData.push({
          date: new Date(dateStr),
          exerciseMinutes: totalMinutes,
          activeMinutes: totalMinutes,
          caloriesBurned: totalCalories > 0 ? totalCalories : undefined,
          distance: totalDistance > 0 ? totalDistance : undefined, // meters
          heartRate: avgHeartRate,
          provider: HealthDataProvider.STRAVA,
          rawData: {
            activities: dayActivities.map((act) => ({
              id: act.id,
              name: act.name,
              type: act.type,
              distance: act.distance,
              moving_time: act.moving_time,
              calories: act.calories,
              average_heartrate: act.average_heartrate,
              max_heartrate: act.max_heartrate,
            })),
          },
        });
      });

      this.logger.log(`Transformed ${healthData.length} days of Strava data`);

      return healthData;
    } catch (error) {
      this.logger.error(`Failed to fetch Strava data: ${error.message}`);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthCredentials> {
    this.logger.log('Refreshing Strava access token');

    try {
      const response = await axios.post(this.TOKEN_URL, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const {
        access_token,
        refresh_token: new_refresh_token,
        expires_at,
      } = response.data;

      this.logger.log('Successfully refreshed Strava token');

      return {
        accessToken: access_token,
        refreshToken: new_refresh_token,
        expiresAt: new Date(expires_at * 1000), // Unix timestamp to Date
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to refresh Strava token');
      throw new Error(`Strava token refresh failed: ${error.message}`);
    }
  }

  async revokeAccess(credentials: OAuthCredentials): Promise<void> {
    this.logger.log('Revoking Strava access');

    try {
      await axios.post(
        'https://www.strava.com/oauth/deauthorize',
        {},
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      this.logger.log('Successfully revoked Strava access');
    } catch (error) {
      this.logger.error('Failed to revoke Strava access');
      // Don't throw - we'll delete locally anyway
    }
  }

  /**
   * Validate credentials by making a test API call
   */
  async validateCredentials(credentials: OAuthCredentials): Promise<boolean> {
    try {
      await this.client.get('/athlete', {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
