/**
 * WeightLossStrategy - Calculate progress for weight loss goals
 */

import { Injectable } from '@nestjs/common';
import { Goal, HealthData } from '@prisma/client';
import { IGoalCalculationStrategy } from './goal-calculation.strategy.interface';
import {
  GoalProgress,
  getDaysRemaining,
  getDaysElapsed,
  getTotalDays,
  formatProgressMessage,
} from '@core/types/goal.types';

@Injectable()
export class WeightLossStrategy implements IGoalCalculationStrategy {
  /**
   * Check if this strategy handles the goal type
   */
  supports(goalType: string): boolean {
    return goalType === 'WEIGHT_LOSS';
  }

  /**
   * Calculate weight loss progress
   */
  calculate(goal: Goal, healthData: HealthData[]): GoalProgress {
    const now = new Date();
    const remainingDays = getDaysRemaining(goal.endDate);
    const daysElapsed = getDaysElapsed(goal.startDate);
    const totalDays = getTotalDays(goal.startDate, goal.endDate);

    // Get current weight (most recent health data)
    const latestData = healthData.find((data) => data.weight !== null);
    const currentWeight =
      latestData?.weight || goal.startValue || goal.targetValue;

    // Start weight
    const startWeight: number = goal.startValue || currentWeight;
    const targetWeight: number = goal.targetValue;

    // Calculate weight lost
    const weightLost = startWeight - currentWeight;
    const weightToLose = startWeight - targetWeight;

    // Calculate progress percentage
    let percentage = 0;
    if (weightToLose > 0) {
      percentage = Math.min(
        100,
        Math.max(0, (weightLost / weightToLose) * 100),
      );
    }

    // Determine status
    let status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    if (percentage >= 100) {
      status = 'completed';
    } else if (now > goal.endDate) {
      status = 'overdue';
    } else if (percentage > 0) {
      status = 'in_progress';
    } else {
      status = 'not_started';
    }

    // Check if on track
    // Expected progress based on time: (daysElapsed / totalDays) * 100
    const expectedProgress = (daysElapsed / totalDays) * 100;
    const isOnTrack = percentage >= expectedProgress * 0.8; // 80% of expected

    // Remaining weight to lose
    const remainingValue = Math.max(0, targetWeight - currentWeight);

    // Generate message
    const message = formatProgressMessage(
      'WEIGHT_LOSS',
      currentWeight,
      targetWeight,
      percentage,
    );

    // Check if completed
    const completedAt = status === 'completed' ? new Date() : undefined;

    return {
      percentage,
      status,
      currentValue: currentWeight,
      targetValue: targetWeight,
      startValue: startWeight,
      remainingValue,
      remainingDays,
      isOnTrack,
      message,
      completedAt,
    };
  }
}
