/**
 * Health Data Provider Factory
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IHealthDataProvider,
  IHealthDataProviderFactory,
} from '@core/providers/health-data-provider.interface';
import { HealthDataProvider } from '@core/types/integration.types';

import { StravaAdapter } from '../adapters/health-providers/strava.adapter';
import { LoseItAdapter } from '../adapters/health-providers/lose-it.adapter';
import { FitbitAdapter } from '../adapters/health-providers/fitbit.adapter';

@Injectable()
export class HealthDataProviderFactory implements IHealthDataProviderFactory {
  private readonly logger = new Logger(HealthDataProviderFactory.name);

  constructor(
    private readonly stravaAdapter: StravaAdapter,
    private readonly loseItAdapter: LoseItAdapter,
    private readonly fitbitAdapter: FitbitAdapter,
  ) {
    this.logger.log('HealthDataProviderFactory initialized');
  }

  /**
   * Get appropriate provider adapter based on type
   *
   * @param provider - Provider type (STRAVA, LOSE_IT, FITBIT)
   * @returns Concrete implementation of IHealthDataProvider
   * @throws Error if provider is not supported
   */
  getProvider(provider: HealthDataProvider): IHealthDataProvider {
    this.logger.debug(`Getting provider adapter for: ${provider}`);

    switch (provider) {
      case HealthDataProvider.STRAVA:
        return this.stravaAdapter;

      case HealthDataProvider.LOSE_IT:
        return this.loseItAdapter;

      case HealthDataProvider.FITBIT:
        return this.fitbitAdapter;

      default:
        const errorMsg = `Unsupported health data provider: ${provider}`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
    }
  }

  /**
   * Get all supported providers
   * @returns Array of supported provider types
   */
  getSupportedProviders(): HealthDataProvider[] {
    return [
      HealthDataProvider.STRAVA,
      HealthDataProvider.LOSE_IT,
      HealthDataProvider.FITBIT,
    ];
  }

  /**
   * Check if a provider is supported
   *
   * @param provider - Provider to check
   * @returns true if supported, false otherwise
   */
  isProviderSupported(provider: HealthDataProvider): boolean {
    const supported = this.getSupportedProviders();
    return supported.includes(provider);
  }

  /**
   * Get provider display information
   */
  getProviderInfo(provider: HealthDataProvider): {
    name: string;
    description: string;
    dataTypes: string[];
  } {
    switch (provider) {
      case HealthDataProvider.STRAVA:
        return {
          name: 'Strava',
          description: 'Track your runs, rides, and workouts',
          dataTypes: ['Exercise', 'Heart Rate', 'Distance', 'Calories'],
        };

      case HealthDataProvider.LOSE_IT:
        return {
          name: 'Lose It!',
          description: 'Track your nutrition and weight',
          dataTypes: ['Calories', 'Weight', 'Nutrition', 'Exercise'],
        };

      case HealthDataProvider.FITBIT:
        return {
          name: 'Fitbit',
          description: 'Comprehensive health and fitness tracking',
          dataTypes: [
            'Steps',
            'Sleep',
            'Heart Rate',
            'Weight',
            'Calories',
            'Activity',
          ],
        };

      default:
        return {
          name: 'Unknown',
          description: 'Unknown provider',
          dataTypes: [],
        };
    }
  }
}
