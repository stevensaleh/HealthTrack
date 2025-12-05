/**
 * Goal Type Definitions
 * Goals represent user fitness/health objectives with target metrics.
 */

import { Goal, GoalType, GoalStatus } from '@prisma/client';

//CreateGoalDto - Data needed to create a new goal

export type CreateGoalDto = {
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number; //  70 (kg), 10000 (steps)
  startValue?: number; // For weight goals
  startDate: Date;
  endDate: Date;
};

//UpdateGoalDto - Data that can be updated
export type UpdateGoalDto = {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: Date;
  status?: GoalStatus;
};

//GoalResponse - Safe goal data for API responses
export type GoalResponse = Goal;

/**
 * GoalProgress - Result of progress calculation
 */
export type GoalProgress = {
  percentage: number;
  status: ProgressStatus;
  currentValue: number;
  targetValue: number;
  startValue?: number;
  remainingValue: number;
  remainingDays: number;
  isOnTrack: boolean;
  message: string;
  completedAt?: Date;
};

//ProgressStatus - Progress state
export type ProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'overdue';

/**
 * GoalWithProgress - Goal with calculated progress
 * Used when Displaying goals with current progress
 */
export type GoalWithProgress = Goal & {
  progress: GoalProgress;
};

/**
 * GoalWithUser - Goal with user information
 * Used when Admin views, showing user details
 */
export type GoalWithUser = Goal & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

/**
 * Goal Validation Rules
 * Realistic ranges for each goal type
 * Prevents unrealistic or dangerous goals
 */
export const GOAL_VALIDATION_RULES: Record<
  GoalType,
  {
    min: number;
    max: number;
    unit: string;
    description: string;
  }
> = {
  WEIGHT_LOSS: {
    min: 0.5,
    max: 50,
    unit: 'kg',
    description: 'Maximum safe weight loss',
  },
  WEIGHT_GAIN: {
    min: 0.5,
    max: 30,
    unit: 'kg',
    description: 'Maximum safe weight gain',
  },
  STEPS: {
    min: 1000,
    max: 50000,
    unit: 'steps/day',
    description: 'Daily step target',
  },
  EXERCISE: {
    min: 10,
    max: 300,
    unit: 'minutes/day',
    description: 'Daily exercise target',
  },
  CALORIES_INTAKE: {
    min: 1200,
    max: 5000,
    unit: 'kcal/day',
    description: 'Daily calorie target',
  },
  CALORIES_BURN: {
    min: 100,
    max: 2000,
    unit: 'kcal/day',
    description: 'Daily calorie burn target',
  },
  SLEEP: {
    min: 4,
    max: 12,
    unit: 'hours/day',
    description: 'Daily sleep target',
  },
  WATER_INTAKE: {
    min: 1,
    max: 10,
    unit: 'liters/day',
    description: 'Daily water intake target',
  },
};

/**
 * Goal Type Categories
 * Groups goal types by calculation method
 */
export const TRAJECTORY_GOALS: GoalType[] = ['WEIGHT_LOSS', 'WEIGHT_GAIN'];

export const DAILY_TARGET_GOALS: GoalType[] = [
  'STEPS',
  'EXERCISE',
  'CALORIES_INTAKE',
  'CALORIES_BURN',
  'SLEEP',
  'WATER_INTAKE',
];

/**
 * Helper function to check if goal type is trajectory based
 */
export function isTrajectoryGoal(type: GoalType): boolean {
  return TRAJECTORY_GOALS.includes(type);
}

//Helper function to check if goal type is daily-target-based
export function isDailyTargetGoal(type: GoalType): boolean {
  return DAILY_TARGET_GOALS.includes(type);
}

//Helper function to calculate days remaining
export function getDaysRemaining(endDate: Date): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

//Helper function to calculate days elapsed since start
export function getDaysElapsed(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

//Helper function to calculate total days in goal period
export function getTotalDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // At least 1 day
}

//Helper function to format goal progress message
export function formatProgressMessage(
  type: GoalType,
  current: number,
  target: number,
  percentage: number,
): string {
  const rules = GOAL_VALIDATION_RULES[type];

  switch (type) {
    case 'WEIGHT_LOSS':
      return `You've lost ${(target - current).toFixed(1)}${rules.unit} toward your ${target}${rules.unit} goal (${percentage.toFixed(0)}%)`;

    case 'WEIGHT_GAIN':
      return `You've gained ${(current - target).toFixed(1)}${rules.unit} toward your ${target}${rules.unit} goal (${percentage.toFixed(0)}%)`;

    case 'STEPS':
      return `${current.toLocaleString()} of ${target.toLocaleString()} ${rules.unit} (${percentage.toFixed(0)}%)`;

    case 'EXERCISE':
      return `${current} of ${target} ${rules.unit} (${percentage.toFixed(0)}%)`;

    case 'CALORIES_INTAKE':
    case 'CALORIES_BURN':
      return `${current} of ${target} ${rules.unit} (${percentage.toFixed(0)}%)`;

    case 'SLEEP':
      return `${current} of ${target} ${rules.unit} (${percentage.toFixed(0)}%)`;

    case 'WATER_INTAKE':
      return `${current} of ${target} ${rules.unit} (${percentage.toFixed(0)}%)`;

    default:
      return `${percentage.toFixed(0)}% complete`;
  }
}
