/**
 * ExerciseStrategy - Calculate progress for daily exercise goals
 *
 * Algorithm:
 * - Get today's exercise minutes (or latest entry)
 * - Calculate progress: todayExercise / targetExercise * 100
 * - This is a DAILY goal - resets each day
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
export class ExerciseStrategy implements IGoalCalculationStrategy {
  supports(goalType: string): boolean {
    return goalType === 'EXERCISE';
  }

  calculate(goal: Goal, healthData: HealthData[]): GoalProgress {
    const now = new Date();
    const remainingDays = getDaysRemaining(goal.endDate);
    const targetExercise: number = Number(goal.targetValue ?? 0);

    // Get today's exercise minutes
    const todayData = healthData.find((data) => data.exercise !== null);
    const currentExercise = todayData?.exercise || 0;

    // Calculate progress percentage
    const percentage = Math.min(100, (currentExercise / targetExercise) * 100);

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

    const isOnTrack = percentage > 0;
    const remainingValue = Math.max(0, targetExercise - currentExercise);

    const message = formatProgressMessage(
      'EXERCISE',
      currentExercise,
      targetExercise,
      percentage,
    );

    const completedAt = status === 'completed' ? now : undefined;

    return {
      percentage,
      status,
      currentValue: currentExercise,
      targetValue: targetExercise,
      remainingValue,
      remainingDays,
      isOnTrack,
      message,
      completedAt,
    };
  }
}
