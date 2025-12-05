/**
 * IHealthDataRepository - HealthData Repository Interface
 * defines operations for health data management
 */

import { HealthData } from '@prisma/client';
import {
  CreateHealthDataDto,
  UpdateHealthDataDto,
  HealthDataWithUser,
  MetricType,
} from '@core/types/health-data.types';

export interface IHealthDataRepository {
  //Find health data entry by ID
  findById(id: string): Promise<HealthData | null>;

  //Find all health data for a specific user
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<HealthData[]>;

  //Find health data for user within date range
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HealthData[]>;

  //Find the most recent health data entry for a user
  findLatestByUser(userId: string): Promise<HealthData | null>;

  //Find health data entry for user on specific date
  findByUserAndDate(userId: string, date: Date): Promise<HealthData | null>;

  //Create new health data entry
  create(data: CreateHealthDataDto): Promise<HealthData>;

  //Update existing health data entry
  update(id: string, data: UpdateHealthDataDto): Promise<HealthData>;

  //Delete health data entry

  delete(id: string): Promise<void>;

  //Delete all entries for user within date range
  deleteByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  //Get average value for a specific metric over a date range
  getAverageMetric(
    userId: string,
    metric: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null>;

  //Count total entries for a user
  countByUser(userId: string): Promise<number>;

  //Find entry with user information included
  findByIdWithUser(id: string): Promise<HealthDataWithUser | null>;
}
