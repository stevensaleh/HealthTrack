/**
 * Fitbit API Adapter
 *
 * Implements IHealthDataProvider for Fitbit comprehensive health tracking API.
 *
 * Fitbit provides:
 * - Activity data (steps, distance, calories)
 * - Sleep data (duration, efficiency)
 * - Heart rate data (resting, average)
 * - Weight/body data
 *
 * API Documentation: https://dev.fitbit.com/build/reference
 * OAuth 2.0 with Basic Auth header for token exchange
 * Rate Limit: 150 requests/hour per user
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';

import { IHealthDataProvider } from '@core/providers/health-data-provider.interface';
import {
  HealthDataProvider,
  OAuthCredentials,
  ExternalHealthData,
  AuthorizationUrlResponse,
} from '@core/types/integration.types';

@Injectable()
export class FitbitAdapter implements IHealthDataProvider {
  private readonly logger = new Logger(FitbitAdapter.name);
  private readonly client: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  // Fitbit API endpoints
  private readonly BASE_URL = 'https://api.fitbit.com/1';
  private readonly AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
  private readonly TOKEN_URL = 'https://api.fitbit.com/oauth2/token';

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('FITBIT_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('FITBIT_CLIENT_SECRET') || '';
    this.redirectUri =
      this.configService.get<string>('OAUTH_REDIRECT_URI') || '';

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
        this.logger.error(`Fitbit API Error: ${error.message}`);
        if (error.response) {
          this.logger.error(`Status: ${error.response.status}`);
          this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);

          // Check for rate limit
          if (error.response.status === 429) {
            this.logger.warn('Fitbit rate limit exceeded');
          }
        }
        throw error;
      },
    );
  }

  getProviderName(): HealthDataProvider {
    return HealthDataProvider.FITBIT;
  }

  async getAuthorizationUrl(state: string): Promise<AuthorizationUrlResponse> {
    this.logger.log('Generating Fitbit authorization URL');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'activity heartrate sleep weight nutrition profile',
      state: state,
    });

    const authUrl = `${this.AUTH_URL}?${params.toString()}`;

    return {
      authUrl,
      state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
  }

  async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    this.logger.log('Exchanging authorization code for Fitbit token');

    try {
      // Fitbit requires Basic Auth with base64(clientId:clientSecret)
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        this.TOKEN_URL,
        qs.stringify({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      this.logger.log('Successfully obtained Fitbit access token');

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000), // 8 hours
        scope: scope,
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to exchange Fitbit authorization code');
      throw new Error(`Fitbit token exchange failed: ${error.message}`);
    }
  }

  async fetchHealthData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalHealthData[]> {
    this.logger.log(
      `Fetching Fitbit data from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    const healthData: ExternalHealthData[] = [];

    try {
      // Calculate date range
      const dates = this.getDateRange(startDate, endDate);

      // Fetch data for each date (Fitbit API works best with individual dates)
      for (const date of dates) {
        const dateStr = this.formatDate(date);

        try {
          // Fetch all data types in parallel for this date
          const [activityData, sleepData, heartRateData, weightData] =
            await Promise.allSettled([
              this.fetchActivityData(credentials, dateStr),
              this.fetchSleepData(credentials, dateStr),
              this.fetchHeartRateData(credentials, dateStr),
              this.fetchWeightData(credentials, dateStr),
            ]);

          // Combine all data for this date
          const dayData: Partial<ExternalHealthData> = {
            date: new Date(dateStr),
            provider: HealthDataProvider.FITBIT,
          };

          // Process activity data
          if (activityData.status === 'fulfilled' && activityData.value) {
            const activity = activityData.value;
            dayData.steps = activity.summary?.steps;
            dayData.caloriesBurned = activity.summary?.caloriesOut;
            dayData.distance = activity.summary?.distances?.[0]?.distance
              ? activity.summary.distances[0].distance * 1000 // km to meters
              : undefined;
            dayData.activeMinutes =
              (activity.summary?.veryActiveMinutes || 0) +
              (activity.summary?.fairlyActiveMinutes || 0);
            dayData.exerciseMinutes = dayData.activeMinutes;
          }

          // Process sleep data
          if (sleepData.status === 'fulfilled' && sleepData.value) {
            const sleep = sleepData.value;
            if (sleep.sleep?.[0]) {
              dayData.sleepMinutes = sleep.sleep[0].minutesAsleep;
            }
          }

          // Process heart rate data
          if (heartRateData.status === 'fulfilled' && heartRateData.value) {
            const heartRate = heartRateData.value;
            if (heartRate['activities-heart']?.[0]?.value) {
              dayData.restingHeartRate =
                heartRate['activities-heart'][0].value.restingHeartRate;
              dayData.heartRate = dayData.restingHeartRate;
            }
          }

          // Process weight data
          if (weightData.status === 'fulfilled' && weightData.value) {
            const weight = weightData.value;
            if (weight.weight?.[0]) {
              dayData.weight = weight.weight[0].weight;
            }
          }

          // Only add if we have at least some data
          if (
            dayData.steps ||
            dayData.weight ||
            dayData.sleepMinutes ||
            dayData.heartRate
          ) {
            healthData.push(dayData as ExternalHealthData);
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to fetch Fitbit data for ${dateStr}: ${dateError.message}`,
          );
          // Continue with next date
        }

        // Rate limit protection: small delay between dates
        await this.delay(100);
      }

      this.logger.log(`Fetched ${healthData.length} days of Fitbit data`);

      return healthData;
    } catch (error) {
      this.logger.error(`Failed to fetch Fitbit data: ${error.message}`);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthCredentials> {
    this.logger.log('Refreshing Fitbit access token');

    try {
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        this.TOKEN_URL,
        qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const {
        access_token,
        refresh_token: new_refresh_token,
        expires_in,
      } = response.data;

      this.logger.log('Successfully refreshed Fitbit token');

      return {
        accessToken: access_token,
        refreshToken: new_refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to refresh Fitbit token');
      throw new Error(`Fitbit token refresh failed: ${error.message}`);
    }
  }

  async revokeAccess(credentials: OAuthCredentials): Promise<void> {
    this.logger.log('Revoking Fitbit access');

    try {
      const basicAuth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      await axios.post(
        'https://api.fitbit.com/oauth2/revoke',
        qs.stringify({
          token: credentials.accessToken,
        }),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.log('Successfully revoked Fitbit access');
    } catch (error) {
      this.logger.error('Failed to revoke Fitbit access');
      // Don't throw - we'll delete locally anyway
    }
  }

  /**
   * Fetch activity data for a specific date
   */
  private async fetchActivityData(
    credentials: OAuthCredentials,
    date: string,
  ): Promise<any> {
    const response = await this.client.get(
      `/user/-/activities/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      },
    );
    return response.data;
  }

  /**
   * Fetch sleep data for a specific date
   */
  private async fetchSleepData(
    credentials: OAuthCredentials,
    date: string,
  ): Promise<any> {
    const response = await this.client.get(`/user/-/sleep/date/${date}.json`, {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });
    return response.data;
  }

  /**
   * Fetch heart rate data for a specific date
   */
  private async fetchHeartRateData(
    credentials: OAuthCredentials,
    date: string,
  ): Promise<any> {
    const response = await this.client.get(
      `/user/-/activities/heart/date/${date}/1d.json`,
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      },
    );
    return response.data;
  }

  /**
   * Fetch weight data for a date range (30 days max)
   */
  private async fetchWeightData(
    credentials: OAuthCredentials,
    date: string,
  ): Promise<any> {
    const response = await this.client.get(
      `/user/-/body/log/weight/date/${date}/30d.json`,
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      },
    );
    return response.data;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate array of dates between start and end
   */
  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
