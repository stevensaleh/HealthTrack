/**
 * Goal DTOs
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { GoalType, GoalStatus } from '@prisma/client';

/**
 * DTO for creating a goal
 */
export class CreateGoalDto {
  @ApiProperty({
    description: 'Type of goal',
    enum: GoalType,
    example: GoalType.WEIGHT_LOSS,
  })
  @IsEnum(GoalType)
  @IsNotEmpty()
  type: GoalType;

  @ApiProperty({
    description: 'Goal title',
    example: 'Lose 5kg by summer',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the goal',
    example: 'I want to lose 5kg to feel healthier and more confident',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Target value for the goal',
    example: 65,
  })
  @IsNumber()
  @IsNotEmpty()
  targetValue: number;

  @ApiPropertyOptional({
    description:
      'Starting value (required for weight goals, optional for others)',
    example: 70,
  })
  @IsNumber()
  @IsOptional()
  startValue?: number;

  @ApiPropertyOptional({
    description: 'Start date (ISO format). Defaults to today if not provided.',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Target end date (ISO format)',
    example: '2024-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

/**
 * DTO for updating a goal
 */
export class UpdateGoalDto {
  @ApiPropertyOptional({
    description: 'Updated goal title',
    example: 'Lose 7kg by summer',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Adjusted target after consultation with nutritionist',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated target value',
    example: 63,
  })
  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @ApiPropertyOptional({
    description: 'Updated end date (ISO format)',
    example: '2024-07-15',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

/**
 * Response DTO for goal without progress
 */
export class GoalResponseDto {
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
    description: 'Goal type',
    enum: GoalType,
    example: GoalType.WEIGHT_LOSS,
  })
  type: GoalType;

  @ApiProperty({
    description: 'Goal status',
    enum: GoalStatus,
    example: GoalStatus.ACTIVE,
  })
  status: GoalStatus;

  @ApiProperty({
    description: 'Goal title',
    example: 'Lose 5kg by summer',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Goal description',
    example: 'I want to lose 5kg to feel healthier and more confident',
  })
  description?: string;

  @ApiProperty({
    description: 'Target value',
    example: 65,
  })
  targetValue: number;

  @ApiPropertyOptional({
    description: 'Starting value',
    example: 70,
  })
  startValue?: number;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Target end date',
    example: '2024-06-15T00:00:00.000Z',
  })
  endDate: Date;

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
 * DTO for goal progress information
 */
export class GoalProgressDto {
  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 60,
  })
  percentage: number;

  @ApiProperty({
    description: 'Current value',
    example: 67,
  })
  currentValue: number;

  @ApiProperty({
    description: 'Amount remaining to reach target',
    example: 2,
  })
  remaining: number;

  @ApiProperty({
    description: 'Whether the goal is on track',
    example: true,
  })
  onTrack: boolean;

  @ApiProperty({
    description: 'Days elapsed since start',
    example: 30,
  })
  daysElapsed: number;

  @ApiProperty({
    description: 'Days remaining until end date',
    example: 120,
  })
  daysRemaining: number;

  @ApiPropertyOptional({
    description: 'Projected completion date based on current progress',
    example: '2024-06-10T00:00:00.000Z',
  })
  projectedCompletionDate?: Date;

  @ApiPropertyOptional({
    description: 'Message describing progress status',
    example: "Great progress! You're ahead of schedule.",
  })
  message?: string;
}

/**
 * Response DTO for goal with progress
 */
export class GoalWithProgressResponseDto {
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
    description: 'Goal type',
    enum: GoalType,
    example: GoalType.WEIGHT_LOSS,
  })
  type: GoalType;

  @ApiProperty({
    description: 'Goal status',
    enum: GoalStatus,
    example: GoalStatus.ACTIVE,
  })
  status: GoalStatus;

  @ApiProperty({
    description: 'Goal title',
    example: 'Lose 5kg by summer',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Goal description',
    example: 'I want to lose 5kg to feel healthier and more confident',
  })
  description?: string;

  @ApiProperty({
    description: 'Target value',
    example: 65,
  })
  targetValue: number;

  @ApiPropertyOptional({
    description: 'Starting value',
    example: 70,
  })
  startValue?: number;

  @ApiProperty({
    description: 'Start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Target end date',
    example: '2024-06-15T00:00:00.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Current progress information',
    type: GoalProgressDto,
  })
  progress: GoalProgressDto;

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
 * Response DTO for goal statistics
 */
export class GoalStatsResponseDto {
  @ApiProperty({
    description: 'Total number of goals',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Number of active goals',
    example: 3,
  })
  active: number;

  @ApiProperty({
    description: 'Number of completed goals',
    example: 5,
  })
  completed: number;

  @ApiProperty({
    description: 'Number of cancelled goals',
    example: 2,
  })
  cancelled: number;

  @ApiProperty({
    description: 'Goal completion rate (percentage)',
    example: 50,
  })
  completionRate: number;
}

/**
 * Response DTO for goal status change operations
 */
export class GoalStatusChangeResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Goal marked as completed',
  })
  message: string;

  @ApiProperty({
    description: 'Updated goal',
    type: GoalResponseDto,
  })
  goal: GoalResponseDto;
}

/**
 * Response DTO for goal deletion
 */
export class GoalDeleteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Goal deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'ID of deleted goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  goalId: string;
}

/**
 * Response DTO for list of goals
 */
export class GoalListResponseDto {
  @ApiProperty({
    description: 'List of goals with progress',
    type: [GoalWithProgressResponseDto],
  })
  goals: GoalWithProgressResponseDto[];

  @ApiProperty({
    description: 'Total number of goals returned',
    example: 5,
  })
  total: number;
}
