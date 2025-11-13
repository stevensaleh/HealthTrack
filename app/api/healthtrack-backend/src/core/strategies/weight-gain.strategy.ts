/**
 * WeightGainStrategy - Calculate progress for weight gain goals
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
export class WeightGainStrategy implements IGoalCalculationStrategy {
  supports(goalType: string): boolean {
    return goalType === 'WEIGHT_GAIN';
  }

  calculate(goal: Goal, healthData: HealthData[]): GoalProgress {
    const now = new Date();
    const remainingDays = getDaysRemaining(goal.endDate);
    const daysElapsed = getDaysElapsed(goal.startDate);
    const totalDays = getTotalDays(goal.startDate, goal.endDate);

    // Get current weight
    const latestData = healthData.find((data) => data.weight !== null);
    const currentWeight =
      latestData?.weight || goal.startValue || goal.targetValue;

    // Start and target weights
    const startWeight = goal.startValue || currentWeight;
    const targetWeight = goal.targetValue;

    // Calculate weight gained
    const weightGained = currentWeight - startWeight;
    const weightToGain = targetWeight - startWeight;

    // Calculate progress percentage
    let percentage = 0;
    if (weightToGain > 0) {
      percentage = Math.min(
        100,
        Math.max(0, (weightGained / weightToGain) * 100),
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
    const expectedProgress = (daysElapsed / totalDays) * 100;
    const isOnTrack = percentage >= expectedProgress * 0.8;

    // Remaining weight to gain
    const remainingValue = Math.max(0, targetWeight - currentWeight);

    // Generate message
    const message = formatProgressMessage(
      'WEIGHT_GAIN',
      currentWeight,
      targetWeight,
      percentage,
    );

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
