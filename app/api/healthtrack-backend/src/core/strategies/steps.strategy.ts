/**
 * StepsStrategy - Calculate progress for daily step goals
 *
 * Algorithm:
 * - Get today's steps (or latest entry)
 * - Calculate progress: todaySteps / targetSteps * 100
 * - This is a DAILY goal - resets each day
 *
 */

import { Injectable } from '@nestjs/common';
import { Goal, HealthData } from '@prisma/client';
import { IGoalCalculationStrategy } from './goal-calculation.strategy.interface';
import {
  GoalProgress,
  getDaysRemaining,
  formatProgressMessage,
} from '@core/types/goal.types';

@Injectable()
export class StepsStrategy implements IGoalCalculationStrategy {
  supports(goalType: string): boolean {
    return goalType === 'STEPS';
  }

  calculate(goal: Goal, healthData: HealthData[]): GoalProgress {
    const now = new Date();
    const remainingDays = getDaysRemaining(goal.endDate);
    const targetSteps = goal.targetValue;

    // Get today's steps (most recent entry)
    const todayData = healthData.find((data) => data.steps !== null);
    const currentSteps = todayData?.steps || 0;

    // Calculate progress percentage
    const percentage = Math.min(100, (currentSteps / targetSteps) * 100);

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

    // For daily goals, "on track" means making progress today
    const isOnTrack = percentage > 0;

    // Remaining steps
    const remainingValue = Math.max(0, targetSteps - currentSteps);

    // Generate message
    const message = formatProgressMessage(
      'STEPS',
      currentSteps,
      targetSteps,
      percentage,
    );

    const completedAt = status === 'completed' ? now : undefined;

    return {
      percentage,
      status,
      currentValue: currentSteps,
      targetValue: targetSteps,
      remainingValue,
      remainingDays,
      isOnTrack,
      message,
      completedAt,
    };
  }
}
