/**
 * Health DTOs (Data Transfer Objects)
 * Defines the structure of data for health tracking operations
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsInt,
} from 'class-validator';

/**
 * DTO for creating/logging health data
 */
export class CreateHealthDataDto {
  @ApiPropertyOptional({
    description:
      'Date for the health data entry (ISO format). Defaults to today if not provided.',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70.5,
    minimum: 20,
    maximum: 300,
  })
  @IsNumber()
  @Min(20)
  @Max(300)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175,
    minimum: 50,
    maximum: 250,
  })
  @IsNumber()
  @Min(50)
  @Max(250)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Steps count',
    example: 10000,
    minimum: 0,
    maximum: 100000,
  })
  @IsInt()
  @Min(0)
  @Max(100000)
  @IsOptional()
  steps?: number;

  @ApiPropertyOptional({
    description: 'Calories consumed',
    example: 2000,
    minimum: 0,
    maximum: 10000,
  })
  @IsInt()
  @Min(0)
  @Max(10000)
  @IsOptional()
  calories?: number;

  @ApiPropertyOptional({
    description: 'Sleep duration in hours',
    example: 7.5,
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  @Min(0)
  @Max(24)
  @IsOptional()
  sleep?: number;

  @ApiPropertyOptional({
    description: 'Water intake in liters',
    example: 2.5,
    minimum: 0,
    maximum: 20,
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  water?: number;

  @ApiPropertyOptional({
    description: 'Exercise duration in minutes',
    example: 45,
    minimum: 0,
    maximum: 1440,
  })
  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  exercise?: number;

  @ApiPropertyOptional({
    description: 'Heart rate in beats per minute',
    example: 72,
    minimum: 30,
    maximum: 250,
  })
  @IsInt()
  @Min(30)
  @Max(250)
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the day',
    example: 'Felt great after morning run',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Mood for the day',
    example: 'Happy',
  })
  @IsString()
  @IsOptional()
  mood?: string;
}

/**
 * DTO for updating health data
 */
export class UpdateHealthDataDto {
  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70.5,
    minimum: 20,
    maximum: 300,
  })
  @IsNumber()
  @Min(20)
  @Max(300)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175,
    minimum: 50,
    maximum: 250,
  })
  @IsNumber()
  @Min(50)
  @Max(250)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Steps count',
    example: 10000,
    minimum: 0,
    maximum: 100000,
  })
  @IsInt()
  @Min(0)
  @Max(100000)
  @IsOptional()
  steps?: number;

  @ApiPropertyOptional({
    description: 'Calories consumed',
    example: 2000,
    minimum: 0,
    maximum: 10000,
  })
  @IsInt()
  @Min(0)
  @Max(10000)
  @IsOptional()
  calories?: number;

  @ApiPropertyOptional({
    description: 'Sleep duration in hours',
    example: 7.5,
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  @Min(0)
  @Max(24)
  @IsOptional()
  sleep?: number;

  @ApiPropertyOptional({
    description: 'Water intake in liters',
    example: 2.5,
    minimum: 0,
    maximum: 20,
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  water?: number;

  @ApiPropertyOptional({
    description: 'Exercise duration in minutes',
    example: 45,
    minimum: 0,
    maximum: 1440,
  })
  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  exercise?: number;

  @ApiPropertyOptional({
    description: 'Heart rate in beats per minute',
    example: 72,
    minimum: 30,
    maximum: 250,
  })
  @IsInt()
  @Min(30)
  @Max(250)
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the day',
    example: 'Felt great after morning run',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Mood for the day',
    example: 'Happy',
  })
  @IsString()
  @IsOptional()
  mood?: string;
}

/**
 * Response DTO for health data
 */
export class HealthDataResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Date of the entry',
    example: '2024-01-15T00:00:00.000Z',
  })
  date: Date;

  @ApiPropertyOptional({
    description: 'Weight in kilograms',
    example: 70.5,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Height in centimeters',
    example: 175,
  })
  height?: number;

  @ApiPropertyOptional({
    description: 'Steps count',
    example: 10000,
  })
  steps?: number;

  @ApiPropertyOptional({
    description: 'Calories consumed',
    example: 2000,
  })
  calories?: number;

  @ApiPropertyOptional({
    description: 'Sleep duration in hours',
    example: 7.5,
  })
  sleep?: number;

  @ApiPropertyOptional({
    description: 'Water intake in liters',
    example: 2.5,
  })
  water?: number;

  @ApiPropertyOptional({
    description: 'Exercise duration in minutes',
    example: 45,
  })
  exercise?: number;

  @ApiPropertyOptional({
    description: 'Heart rate in beats per minute',
    example: 72,
  })
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Felt great after morning run',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Mood for the day',
    example: 'Happy',
  })
  mood?: string;

  @ApiPropertyOptional({
    description: 'Data source',
    example: 'STRAVA',
    enum: ['STRAVA', 'FITBIT', 'LOSE_IT', 'MANUAL'],
  })
  source?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T12:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * DTO for health statistics response
 */
export class HealthStatsResponseDto {
  @ApiProperty({
    description: 'Time period for statistics',
    example: '2024-01-01 to 2024-01-07',
  })
  period: string;

  @ApiProperty({
    description: 'Number of entries in period',
    example: 7,
  })
  entriesCount: number;

  @ApiPropertyOptional({
    description: 'Average weight',
    example: 70.5,
  })
  avgWeight?: number;

  @ApiPropertyOptional({
    description: 'Weight trend direction',
    enum: ['increasing', 'decreasing', 'stable'],
    example: 'decreasing',
  })
  weightTrend?: 'increasing' | 'decreasing' | 'stable';

  @ApiPropertyOptional({
    description: 'Average steps per day',
    example: 8500,
  })
  avgSteps?: number;

  @ApiPropertyOptional({
    description: 'Total steps in period',
    example: 59500,
  })
  totalSteps?: number;

  @ApiPropertyOptional({
    description: 'Average calories per day',
    example: 2100,
  })
  avgCalories?: number;

  @ApiPropertyOptional({
    description: 'Total calories in period',
    example: 14700,
  })
  totalCalories?: number;

  @ApiPropertyOptional({
    description: 'Average sleep hours',
    example: 7.5,
  })
  avgSleep?: number;

  @ApiPropertyOptional({
    description: 'Average water intake in liters',
    example: 2.3,
  })
  avgWater?: number;

  @ApiPropertyOptional({
    description: 'Average exercise minutes per day',
    example: 35,
  })
  avgExercise?: number;

  @ApiPropertyOptional({
    description: 'Total exercise minutes in period',
    example: 245,
  })
  totalExercise?: number;

  @ApiPropertyOptional({
    description: 'Average heart rate',
    example: 72,
  })
  avgHeartRate?: number;
}

/**
 * DTO for querying health data
 */
export class HealthQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 30,
    default: 30,
  })
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

/**
 * DTO for custom stats query
 */
export class CustomStatsQueryDto {
  @ApiProperty({
    description: 'Start date for statistics (ISO format)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for statistics (ISO format)',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate: string;
}

/**
 * Response DTO for trend analysis
 */
export class TrendResponseDto {
  @ApiProperty({
    description: 'Metric being analyzed',
    example: 'weight',
  })
  metric: string;

  @ApiProperty({
    description: 'Number of days analyzed',
    example: 7,
  })
  days: number;

  @ApiProperty({
    description: 'Trend direction',
    enum: ['increasing', 'decreasing', 'stable'],
    example: 'decreasing',
    nullable: true,
  })
  trend: 'increasing' | 'decreasing' | 'stable' | null;

  @ApiPropertyOptional({
    description: 'Additional context about the trend',
    example: 'Weight has decreased by 2kg over the past 7 days',
  })
  message?: string;
}

/**
 * Response DTO for tracking status
 */
export class TrackingStatusDto {
  @ApiProperty({
    description: 'Whether user logged data today',
    example: true,
  })
  loggedToday: boolean;

  @ApiProperty({
    description: 'Total days tracked',
    example: 127,
  })
  totalDaysTracked: number;

  @ApiPropertyOptional({
    description: 'Latest entry date',
    example: '2024-01-15T00:00:00.000Z',
  })
  latestEntryDate?: Date;
}
