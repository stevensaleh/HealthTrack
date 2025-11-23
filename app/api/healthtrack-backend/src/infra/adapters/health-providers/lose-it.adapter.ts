/**
 * Lose It! API Adapter
 *
 * Implements IHealthDataProvider for Lose It! nutrition tracking API.
 *
 * Lose It! provides:
 * - Nutrition data (calories consumed)
 * - Weight entries
 * - Exercise data (calories burned)
 *
 * API Documentation: https://api.loseit.com/docs
 * OAuth 2.0 with standard flow
 * Rate Limit: 60 requests/hour
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
export class LoseItAdapter implements IHealthDataProvider {
  private readonly logger = new Logger(LoseItAdapter.name);
  private readonly client: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  // Lose It! API endpoints
  private readonly BASE_URL = 'https://api.loseit.com';
  private readonly AUTH_URL = 'https://api.loseit.com/oauth/authorize';
  private readonly TOKEN_URL = 'https://api.loseit.com/oauth/token';

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('LOSE_IT_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('LOSE_IT_CLIENT_SECRET') || '';
    this.redirectUri =
      this.configService.get<string>('OAUTH_REDIRECT_URI') || '';

    // Create axios instance for API calls
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Lose It! API Error: ${error.message}`);
        if (error.response) {
          this.logger.error(`Status: ${error.response.status}`);
          this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
      },
    );
  }

  getProviderName(): HealthDataProvider {
    return HealthDataProvider.LOSE_IT;
  }

  async getAuthorizationUrl(state: string): Promise<AuthorizationUrlResponse> {
    this.logger.log('Generating Lose It! authorization URL');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'food.read weight.read exercise.read',
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
    this.logger.log('Exchanging authorization code for Lose It! token');

    try {
      const response = await axios.post(
        this.TOKEN_URL,
        qs.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      this.logger.log('Successfully obtained Lose It! access token');

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scope: scope,
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to exchange Lose It! authorization code');
      throw new Error(`Lose It! token exchange failed: ${error.message}`);
    }
  }

  async fetchHealthData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalHealthData[]> {
    this.logger.log(
      `Fetching Lose It! data from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    const healthData: ExternalHealthData[] = [];

    try {
      // Define types for Lose It! API responses
      type NutritionEntry = {
        date: string;
        calories: { burned: number };
        [key: string]: any;
      };
      type WeightEntry = { date: string; weight: number; [key: string]: any };
      type ExerciseEntry = {
        date: string;
        duration: number;
        calories_burned: number;
        [key: string]: any;
      };

      // Fetch nutrition data (calories, macros)
      const nutritionData = (await this.fetchNutritionData(
        credentials,
        startDate,
        endDate,
      )) as NutritionEntry[];

      // Fetch weight entries
      const weightData = (await this.fetchWeightData(
        credentials,
        startDate,
        endDate,
      )) as WeightEntry[];

      // Fetch exercise data
      const exerciseData = (await this.fetchExerciseData(
        credentials,
        startDate,
        endDate,
      )) as ExerciseEntry[];

      // Combine all data sources by date
      const dataByDate = new Map<string, Partial<ExternalHealthData>>();

      // Process nutrition data
      nutritionData.forEach((entry: NutritionEntry) => {
        const dateKey = entry.date;
        if (!dataByDate.has(dateKey)) {
          dataByDate.set(dateKey, { date: new Date(dateKey) });
        }
        const data = dataByDate.get(dateKey);
        if (data) {
          data.caloriesBurned = entry.calories.burned;
        }
      });
      // Process weight data
      weightData.forEach((entry: WeightEntry) => {
        const dateKey = entry.date;
        if (!dataByDate.has(dateKey)) {
          dataByDate.set(dateKey, { date: new Date(dateKey) });
        }
        const data = dataByDate.get(dateKey);
        if (data) {
          data.weight = entry.weight;
        }
      });

      // Process exercise data
      exerciseData.forEach((entry: ExerciseEntry) => {
        const dateKey = entry.date;
        if (!dataByDate.has(dateKey)) {
          dataByDate.set(dateKey, { date: new Date(dateKey) });
        }
        const data = dataByDate.get(dateKey);
        if (data) {
          data.exerciseMinutes = (data.exerciseMinutes || 0) + entry.duration;
          data.caloriesBurned =
            (data.caloriesBurned || 0) + entry.calories_burned;
        }
      });

      // Convert map to array
      dataByDate.forEach((data) => {
        const date = data.date;
        if (!date) {
          // skip entries without a date (should not happen because we set date when creating entries)
          return;
        }

        healthData.push({
          date: date,
          weight: data.weight,
          caloriesBurned: data.caloriesBurned,
          exerciseMinutes: data.exerciseMinutes,
          provider: HealthDataProvider.LOSE_IT,
          rawData: data,
        });
      });

      this.logger.log(`Fetched ${healthData.length} records from Lose It!`);

      return healthData;
    } catch (error) {
      this.logger.error(`Failed to fetch Lose It! data: ${error.message}`);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthCredentials> {
    this.logger.log('Refreshing Lose It! access token');

    try {
      const response = await axios.post(
        this.TOKEN_URL,
        qs.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const {
        access_token,
        refresh_token: new_refresh_token,
        expires_in,
      } = response.data;

      this.logger.log('Successfully refreshed Lose It! token');

      return {
        accessToken: access_token,
        refreshToken: new_refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error('Failed to refresh Lose It! token');
      throw new Error(`Lose It! token refresh failed: ${error.message}`);
    }
  }

  async revokeAccess(credentials: OAuthCredentials): Promise<void> {
    this.logger.log('Revoking Lose It! access');

    try {
      this.logger.warn(
        'Lose It! does not provide a revocation endpoint. Token will expire naturally.',
      );
    } catch (error) {
      this.logger.error('Failed to revoke Lose It! access');
    }
  }

  //Fetch nutrition data (calories)
  private async fetchNutritionData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    const response = await this.client.get('/v1/nutrition/daily', {
      params: {
        start_date: start,
        end_date: end,
      },
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    return response.data || [];
  }

  //fetch weight entries
  private async fetchWeightData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    const response = await this.client.get('/v1/weight/entries', {
      params: {
        start_date: start,
        end_date: end,
      },
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    return response.data || [];
  }

  //Fetch exercise entries
  private async fetchExerciseData(
    credentials: OAuthCredentials,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    const response = await this.client.get('/v1/exercise/entries', {
      params: {
        start_date: start,
        end_date: end,
      },
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    return response.data || [];
  }

  //Format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
