/**
 * HealthService - Business Logic Layer
 * This service contains all business rules for health data management.
 */

import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { IHealthDataRepository } from '@core/repositories/health-data.repository.interface';
import {
  //CreateHealthDataDto,
  UpdateHealthDataDto,
  HealthDataResponse,
  HealthDataStats,
  MetricType,
  TrendDirection,
  METRIC_VALIDATION_RULES,
  getLastNDaysRange,
  toDateOnly,
  //isSameDay,
} from '../types/health-data.types';

//DTOs for service methods
export interface LogHealthDataDto {
  date?: Date;
  weight?: number;
  height?: number;
  steps?: number;
  calories?: number;
  sleep?: number;
  water?: number;
  exercise?: number;
  heartRate?: number;
  notes?: string;
  mood?: string;
}

export interface HealthDataQuery {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class HealthService {
  constructor(
    @Inject('IHealthDataRepository')
    private readonly healthDataRepo: IHealthDataRepository,
  ) {}

  /**
   * Log daily health data
   * @throws BadRequestException if validation fails
   * @throws ConflictException if entry already exists for date
   */
  async logHealthData(
    userId: string,
    data: LogHealthDataDto,
  ): Promise<HealthDataResponse> {
    // Business Rule 1: At least one metric must be provided
    if (!this.hasAnyMetric(data)) {
      throw new BadRequestException(
        'At least one health metric must be provided',
      );
    }

    // Business Rule 2: Validate all provided metrics
    this.validateMetrics(data);

    // Business Rule 3: Date cannot be in future
    const entryDate = data.date
      ? toDateOnly(data.date)
      : toDateOnly(new Date());
    const today = toDateOnly(new Date());

    if (entryDate > today) {
      throw new BadRequestException('Cannot log health data for future dates');
    }

    // Business Rule 4: Check for duplicate entry
    const existingEntry = await this.healthDataRepo.findByUserAndDate(
      userId,
      entryDate,
    );
    if (existingEntry) {
      throw new ConflictException(
        `Health data already logged for ${entryDate.toISOString().split('T')[0]}. ` +
          'Please update the existing entry instead.',
      );
    }

    // Create entry
    return this.healthDataRepo.create({
      userId,
      date: entryDate,
      weight: data.weight,
      height: data.height,
      steps: data.steps,
      calories: data.calories,
      sleep: data.sleep,
      water: data.water,
      exercise: data.exercise,
      heartRate: data.heartRate,
      notes: data.notes,
      mood: data.mood,
    });
  }

  /**
   * Update existing health data entry
   * @throws NotFoundException if entry doesn't exist or doesn't belong to user
   * @throws BadRequestException if validation fails
   */
  async updateHealthData(
    userId: string,
    entryId: string,
    data: UpdateHealthDataDto,
  ): Promise<HealthDataResponse> {
    // Business Rule 1: Entry must exist and belong to user
    const existing = await this.healthDataRepo.findById(entryId);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Health data entry not found');
    }

    // Business Rule 2: Validate metrics
    this.validateMetrics(data);

    // Update entry
    return this.healthDataRepo.update(entryId, data);
  }

  //Get health data for user with optional filtering
  async getHealthData(
    userId: string,
    query?: HealthDataQuery,
  ): Promise<HealthDataResponse[]> {
    // If date range provided, use range query
    if (query?.startDate && query?.endDate) {
      return this.healthDataRepo.findByUserAndDateRange(
        userId,
        query.startDate,
        query.endDate,
      );
    }

    // Otherwise, get all with pagination
    return this.healthDataRepo.findByUserId(userId, {
      limit: query?.limit || 30, // Default 30 days
      offset: query?.offset || 0,
    });
  }

  /**
   * Get single health data entry
   *
   * @throws NotFoundException if entry doesn't exist or doesn't belong to user
   */
  async getHealthDataById(
    userId: string,
    entryId: string,
  ): Promise<HealthDataResponse> {
    const entry = await this.healthDataRepo.findById(entryId);

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Health data entry not found');
    }

    return entry;
  }

  //Get most recent health data entry
  async getLatestHealthData(
    userId: string,
  ): Promise<HealthDataResponse | null> {
    return this.healthDataRepo.findLatestByUser(userId);
  }

  /**
   * Delete health data entry
   *
   * @throws NotFoundException if entry doesn't exist or doesn't belong to user
   */
  async deleteHealthData(userId: string, entryId: string): Promise<void> {
    const entry = await this.healthDataRepo.findById(entryId);

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Health data entry not found');
    }

    await this.healthDataRepo.delete(entryId);
  }

  /**
   * Get weekly summary statistics
   * Calculates averages and trends for the last 7 days
   */
  async getWeeklySummary(userId: string): Promise<HealthDataStats> {
    const range = getLastNDaysRange(7);
    return this.getStatistics(userId, range.startDate, range.endDate);
  }

  /**
   * Get monthly summary statistics
   * Calculates averages and trends for the last 30 days
   */
  async getMonthlySummary(userId: string): Promise<HealthDataStats> {
    const range = getLastNDaysRange(30);
    return this.getStatistics(userId, range.startDate, range.endDate);
  }

  //Get statistics for custom date range
  async getStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HealthDataStats> {
    const entries = await this.healthDataRepo.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );

    const periodString = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;

    // No data case
    if (entries.length === 0) {
      return {
        period: periodString,
        entriesCount: 0,
      };
    }

    // Calculate averages and totals
    const stats: HealthDataStats = {
      period: periodString,
      entriesCount: entries.length,
    };

    // Weight average and trend
    const weights = entries
      .filter((e) => e.weight !== null)
      .map((e) => e.weight!);
    if (weights.length > 0) {
      stats.avgWeight = this.calculateAverage(weights);
      stats.weightTrend = this.calculateTrend(weights);
    }

    // Steps average, total, and trend
    const steps = entries.filter((e) => e.steps !== null).map((e) => e.steps!);
    if (steps.length > 0) {
      stats.avgSteps = this.calculateAverage(steps);
      stats.totalSteps = this.calculateSum(steps);
      stats.stepsTrend = this.calculateTrend(steps);
    }

    // Calories average and total
    const calories = entries
      .filter((e) => e.calories !== null)
      .map((e) => e.calories!);
    if (calories.length > 0) {
      stats.avgCalories = this.calculateAverage(calories);
      stats.totalCalories = this.calculateSum(calories);
    }

    // Sleep average
    const sleep = entries.filter((e) => e.sleep !== null).map((e) => e.sleep!);
    if (sleep.length > 0) {
      stats.avgSleep = this.calculateAverage(sleep);
    }

    // Water average
    const water = entries.filter((e) => e.water !== null).map((e) => e.water!);
    if (water.length > 0) {
      stats.avgWater = this.calculateAverage(water);
    }

    // Exercise average and total
    const exercise = entries
      .filter((e) => e.exercise !== null)
      .map((e) => e.exercise!);
    if (exercise.length > 0) {
      stats.avgExercise = this.calculateAverage(exercise);
      stats.totalExercise = this.calculateSum(exercise);
    }

    // Heart rate average
    const heartRates = entries
      .filter((e) => e.heartRate !== null)
      .map((e) => e.heartRate!);
    if (heartRates.length > 0) {
      stats.avgHeartRate = this.calculateAverage(heartRates);
    }

    return stats;
  }

  /**
   * Get trend for a specific metric over last N days
   * Returns: 'increasing' | 'decreasing' | 'stable'
   */
  async getMetricTrend(
    userId: string,
    metric: MetricType,
    days: number = 7,
  ): Promise<TrendDirection | null> {
    const range = getLastNDaysRange(days);
    const entries = await this.healthDataRepo.findByUserAndDateRange(
      userId,
      range.startDate,
      range.endDate,
    );

    const values = entries
      .filter((e) => e[metric] !== null)
      .map((e) => e[metric] as number);

    if (values.length < 2) {
      return null; // Need at least 2 data points for trend
    }

    return this.calculateTrend(values);
  }

  /**
   * Check if user has logged data today
   */
  async hasLoggedToday(userId: string): Promise<boolean> {
    const today = toDateOnly(new Date());
    const entry = await this.healthDataRepo.findByUserAndDate(userId, today);
    return entry !== null;
  }

  /**
   * Get total days tracked
   */
  async getTotalDaysTracked(userId: string): Promise<number> {
    return this.healthDataRepo.countByUser(userId);
  }

  //PRIVATE HELPER METHODS

  //Check if at least one metric is provided
  private hasAnyMetric(data: LogHealthDataDto): boolean {
    return !!(
      data.weight !== undefined ||
      data.height !== undefined ||
      data.steps !== undefined ||
      data.calories !== undefined ||
      data.sleep !== undefined ||
      data.water !== undefined ||
      data.exercise !== undefined ||
      data.heartRate !== undefined
    );
  }

  /**
   * Validate all provided metrics against realistic ranges
   * @throws BadRequestException if any metric is out of range
   */
  private validateMetrics(data: LogHealthDataDto | UpdateHealthDataDto): void {
    // Validate weight
    if (data.weight !== undefined) {
      const rules = METRIC_VALIDATION_RULES.weight;
      if (data.weight < rules.min || data.weight > rules.max) {
        throw new BadRequestException(
          `Weight must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate height
    if (data.height !== undefined) {
      const rules = METRIC_VALIDATION_RULES.height;
      if (data.height < rules.min || data.height > rules.max) {
        throw new BadRequestException(
          `Height must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate steps
    if (data.steps !== undefined) {
      const rules = METRIC_VALIDATION_RULES.steps;
      if (data.steps < rules.min || data.steps > rules.max) {
        throw new BadRequestException(
          `Steps must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate calories
    if (data.calories !== undefined) {
      const rules = METRIC_VALIDATION_RULES.calories;
      if (data.calories < rules.min || data.calories > rules.max) {
        throw new BadRequestException(
          `Calories must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate sleep
    if (data.sleep !== undefined) {
      const rules = METRIC_VALIDATION_RULES.sleep;
      if (data.sleep < rules.min || data.sleep > rules.max) {
        throw new BadRequestException(
          `Sleep must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate water
    if (data.water !== undefined) {
      const rules = METRIC_VALIDATION_RULES.water;
      if (data.water < rules.min || data.water > rules.max) {
        throw new BadRequestException(
          `Water intake must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate exercise
    if (data.exercise !== undefined) {
      const rules = METRIC_VALIDATION_RULES.exercise;
      if (data.exercise < rules.min || data.exercise > rules.max) {
        throw new BadRequestException(
          `Exercise must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }

    // Validate heart rate
    if (data.heartRate !== undefined) {
      const rules = METRIC_VALIDATION_RULES.heartRate;
      if (data.heartRate < rules.min || data.heartRate > rules.max) {
        throw new BadRequestException(
          `Heart rate must be between ${rules.min} and ${rules.max} ${rules.unit}`,
        );
      }
    }
  }

  //Calculate average of an array of numbers

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimals
  }

  //Calculate sum of an array of numbers
  private calculateSum(values: number[]): number {
    return values.reduce((acc, val) => acc + val, 0);
  }

  //Calculate trend direction
  private calculateTrend(values: number[]): TrendDirection {
    if (values.length < 3) return 'stable'; // Need at least 3 points

    const midPoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midPoint);
    const secondHalf = values.slice(midPoint);

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    // Calculate percentage difference
    const percentDiff = ((secondAvg - firstAvg) / firstAvg) * 100;

    // Threshold: 5% change is considered a trend
    if (percentDiff > 5) return 'increasing';
    if (percentDiff < -5) return 'decreasing';
    return 'stable';
  }
}
