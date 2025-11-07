/**
 * HealthData Type Definitions
 * These types define the shape of data for HealthData operations.
 */

import { HealthData } from '@prisma/client';

/**
 * CreateHealthDataDto - Data needed to log daily health metrics
 * One entry per user per date
 */
export type CreateHealthDataDto = {
  userId: string;
  date?: Date; // Optional, defaults to today
  weight?: number; // kg
  height?: number; // cm
  steps?: number; // daily steps
  calories?: number; // calories consumed
  sleep?: number; // hours of sleep
  water?: number; // liters of water
  exercise?: number; // minutes of exercise
  heartRate?: number; // average heart rate (bpm)
  notes?: string; // User notes about the day
  mood?: string; // User's mood (e.g., "happy", "tired", "energetic")
};

//UpdateHealthDataDto - Data that can be updated after logging
export type UpdateHealthDataDto = {
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
};

/**
 * HealthDataResponse - Safe health data for API responses
 */
export type HealthDataResponse = HealthData;

//HealthDataWithUser - Health data with user information
export type HealthDataWithUser = HealthData & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

//DateRangeQuery - Parameters for querying by date range
export type DateRangeQuery = {
  startDate: Date;
  endDate: Date;
};

//HealthDataStats - Aggregated statistics over a period
export type HealthDataStats = {
  period: string;
  entriesCount: number; // Number of days with data

  // Averages (null if no data)
  avgWeight?: number;
  avgSteps?: number;
  avgCalories?: number;
  avgSleep?: number;
  avgWater?: number;
  avgExercise?: number;
  avgHeartRate?: number;

  // Totals
  totalSteps?: number;
  totalCalories?: number;
  totalExercise?: number;

  // Trends (calculated)
  weightTrend?: 'increasing' | 'decreasing' | 'stable';
  stepsTrend?: 'increasing' | 'decreasing' | 'stable';
};

//MetricType - Enum of trackable metrics
export type MetricType =
  | 'weight'
  | 'height'
  | 'steps'
  | 'calories'
  | 'sleep'
  | 'water'
  | 'exercise'
  | 'heartRate';

//TrendDirection - Direction of a metric trend
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

//MetricValidationRules - Realistic ranges for each metric
export const METRIC_VALIDATION_RULES = {
  weight: { min: 20, max: 300, unit: 'kg' },
  height: { min: 50, max: 250, unit: 'cm' },
  steps: { min: 0, max: 100000, unit: 'steps' },
  calories: { min: 0, max: 10000, unit: 'kcal' },
  sleep: { min: 0, max: 24, unit: 'hours' },
  water: { min: 0, max: 20, unit: 'liters' },
  exercise: { min: 0, max: 1440, unit: 'minutes' },
  heartRate: { min: 30, max: 250, unit: 'bpm' },
};

//Helper function to format date for consistency
export function toDateOnly(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

//Helper function to check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

//Helper function to get date range for last N days
export function getLastNDaysRange(days: number): DateRangeQuery {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1); // Include today

  return {
    startDate: toDateOnly(startDate),
    endDate: toDateOnly(endDate),
  };
}
