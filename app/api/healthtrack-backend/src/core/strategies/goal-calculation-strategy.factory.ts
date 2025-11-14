/**
 * GoalCalculationStrategyFactory - Selects the correct strategy
 *
 * This factory provides the appropriate calculation strategy
 * based on the goal type.
 */

import { Injectable } from '@nestjs/common';
import { GoalType } from '@prisma/client';
import { IGoalCalculationStrategy } from './goal-calculation.strategy.interface';
import { WeightLossStrategy } from './weight-loss.strategy';
import { WeightGainStrategy } from './weight-gain.strategy';
import { StepsStrategy } from './steps.strategy';
import { ExerciseStrategy } from './exercise.strategy';

@Injectable()
export class GoalCalculationStrategyFactory {
  private strategies: Map<GoalType, IGoalCalculationStrategy>;

  constructor(
    private readonly weightLossStrategy: WeightLossStrategy,
    private readonly weightGainStrategy: WeightGainStrategy,
    private readonly stepsStrategy: StepsStrategy,
    private readonly exerciseStrategy: ExerciseStrategy,
  ) {
    // Register all strategies
    this.strategies = new Map<GoalType, IGoalCalculationStrategy>([
      ['WEIGHT_LOSS', this.weightLossStrategy],
      ['WEIGHT_GAIN', this.weightGainStrategy],
      ['STEPS', this.stepsStrategy],
      ['EXERCISE', this.exerciseStrategy],
      // Add more strategies as needed:
      // ['CALORIES_INTAKE', this.caloriesIntakeStrategy],
      // ['CALORIES_BURN', this.caloriesBurnStrategy],
      // ['SLEEP', this.sleepStrategy],
      // ['WATER_INTAKE', this.waterIntakeStrategy],
    ]);
  }

  /**
   * Get the appropriate strategy for a goal type
   * @param goalType - The type of goal
   * @returns Strategy that can calculate progress for this type
   * @throws Error if no strategy found for type
   */
  getStrategy(goalType: GoalType): IGoalCalculationStrategy {
    const strategy = this.strategies.get(goalType);

    if (!strategy) {
      throw new Error(
        `No calculation strategy found for goal type: ${goalType}`,
      );
    }

    return strategy;
  }

  /**
   * Check if a strategy exists for a goal type
   * @param goalType - The type of goal
   * @returns true if strategy exists
   */
  hasStrategy(goalType: GoalType): boolean {
    return this.strategies.has(goalType);
  }

  /**
   * Get all supported goal types
   * @returns Array of goal types that have strategies
   */
  getSupportedGoalTypes(): GoalType[] {
    return Array.from(this.strategies.keys());
  }
}
