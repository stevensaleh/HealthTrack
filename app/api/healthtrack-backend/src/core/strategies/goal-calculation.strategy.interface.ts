/**
 * IGoalCalculationStrategy - Strategy Pattern Interface
 */

import { Goal } from '@prisma/client';
import { HealthData } from '@prisma/client';
import { GoalProgress } from '@core/types/goal.types';

export interface IGoalCalculationStrategy {
  /**
   * Calculate progress for a goal
   *
   * @param goal - The goal to calculate progress for
   * @param healthData - User's health data (for calculations)
   * @returns GoalProgress with percentage, status, message, etc.
   */
  calculate(goal: Goal, healthData: HealthData[]): GoalProgress;

  /**
   * Check if this strategy can handle the given goal type
   *
   * @param goalType - The type of goal
   * @returns true if this strategy handles this type
   */
  supports(goalType: string): boolean;
}
