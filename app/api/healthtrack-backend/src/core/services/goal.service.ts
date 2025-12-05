/**
 * GoalService - Business Logic Layer
 */

import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GoalType } from '@prisma/client';
import type { IGoalRepository } from '@core/repositories/goal.repository.interface';
import type { IHealthDataRepository } from '@core/repositories/health-data.repository.interface';
import {
  GoalResponse,
  GoalWithProgress,
  GoalProgress,
  GOAL_VALIDATION_RULES,
  isTrajectoryGoal,
} from '@core/types/goal.types';
import { getLastNDaysRange } from '@core/types/health-data.types';
import { GoalCalculationStrategyFactory } from '@core/strategies/goal-calculation-strategy.factory';

/**
 * DTOs for service methods
 */
export interface CreateGoalRequestDto {
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  startValue?: number;
  startDate?: Date;
  endDate: Date;
}

export interface UpdateGoalRequestDto {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: Date;
}

@Injectable()
export class GoalService {
  constructor(
    @Inject('IGoalRepository')
    private readonly goalRepo: IGoalRepository,
    @Inject('IHealthDataRepository')
    private readonly healthDataRepo: IHealthDataRepository,
    private readonly strategyFactory: GoalCalculationStrategyFactory,
  ) {}

  /**
   * Create a new goal
   * 
   * @throws BadRequestException if validation fails
   * @throws ConflictException if active goal of same type exists
   */
  async createGoal(
    userId: string,
    data: CreateGoalRequestDto,
  ): Promise<GoalResponse> {
    this.validateTargetValue(data.type, data.targetValue);

    // Set dates
    const startDate = data.startDate || new Date();
    const endDate = data.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (endDate > oneYearFromNow) {
      throw new BadRequestException(
        'Goal end date cannot be more than 1 year in the future',
      );
    }

    const existingActiveGoal = await this.goalRepo.findActiveByTypeAndUser(
      userId,
      data.type,
    );

    if (existingActiveGoal) {
      throw new ConflictException(
        `You already have an active ${data.type} goal. ` +
          'Please complete or cancel it before creating a new one.',
      );
    }

    if (isTrajectoryGoal(data.type) && !data.startValue) {
      const latestHealthData =
        await this.healthDataRepo.findLatestByUser(userId);

      if (!latestHealthData?.weight) {
        throw new BadRequestException(
          'Please log your current weight before creating a weight goal',
        );
      }

      data.startValue = latestHealthData.weight;
    }

    // Additional validation for weight goals
    if (data.type === 'WEIGHT_LOSS' || data.type === 'WEIGHT_GAIN') {
      if (!data.startValue) {
        throw new BadRequestException(
          'Start value is required for weight goals',
        );
      }

      this.validateWeightGoal(data.type, data.startValue, data.targetValue);
    }

    // Create goal
    return this.goalRepo.create({
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      startValue: data.startValue,
      startDate,
      endDate,
    });
  }

  /**
   * Get goal by ID with progress calculation
   *
   * @throws NotFoundException if goal doesn't exist or doesn't belong to user
   */
  async getGoalWithProgress(
    userId: string,
    goalId: string,
  ): Promise<GoalWithProgress> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    // Calculate progress using Strategy Pattern
    const progress = await this.calculateGoalProgress(goal);

    return {
      ...goal,
      progress,
    };
  }

  /**
   * Get all goals for user with progress
   */
  async getAllGoalsWithProgress(userId: string): Promise<GoalWithProgress[]> {
    const goals = await this.goalRepo.findByUserId(userId);

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await this.calculateGoalProgress(goal);
        return { ...goal, progress };
      }),
    );

    return goalsWithProgress;
  }

  /**
   * Get active goals with progress
   */
  async getActiveGoalsWithProgress(
    userId: string,
  ): Promise<GoalWithProgress[]> {
    const goals = await this.goalRepo.findActiveByUser(userId);

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await this.calculateGoalProgress(goal);
        return { ...goal, progress };
      }),
    );

    return goalsWithProgress;
  }

  /**
   * Update goal
   * @throws NotFoundException if goal doesn't exist or doesn't belong to user
   * @throws BadRequestException if validation fails
   */
  async updateGoal(
    userId: string,
    goalId: string,
    data: UpdateGoalRequestDto,
  ): Promise<GoalResponse> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    if (data.targetValue !== undefined) {
      this.validateTargetValue(goal.type, data.targetValue);

      if (goal.type === 'WEIGHT_LOSS' || goal.type === 'WEIGHT_GAIN') {
        if (!goal.startValue) {
          throw new BadRequestException(
            'Cannot update target for weight goal without start value',
          );
        }
        this.validateWeightGoal(goal.type, goal.startValue, data.targetValue);
      }
    }

    if (data.endDate) {
      if (data.endDate <= goal.startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (data.endDate <= new Date()) {
        throw new BadRequestException('End date must be in the future');
      }
    }

    // Update goal
    return this.goalRepo.update(goalId, data);
  }

  /**
   * Complete a goal
   */
  async completeGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status !== 'ACTIVE') {
      throw new BadRequestException('Only active goals can be completed');
    }

    return this.goalRepo.update(goalId, { status: 'COMPLETED' });
  }

  //Cancel a goal
  async cancelGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status !== 'ACTIVE' && goal.status !== 'PAUSED') {
      throw new BadRequestException(
        'Only active or paused goals can be cancelled',
      );
    }

    return this.goalRepo.update(goalId, { status: 'CANCELLED' });
  }

  //Pause a goal
  async pauseGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status !== 'ACTIVE') {
      throw new BadRequestException('Only active goals can be paused');
    }

    return this.goalRepo.update(goalId, { status: 'PAUSED' });
  }

  //Resume a paused goal
  async resumeGoal(userId: string, goalId: string): Promise<GoalResponse> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status !== 'PAUSED') {
      throw new BadRequestException('Only paused goals can be resumed');
    }

    return this.goalRepo.update(goalId, { status: 'ACTIVE' });
  }

  //Delete a goal
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = await this.goalRepo.findById(goalId);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    await this.goalRepo.delete(goalId);
  }

  //Get goal statistics
  async getGoalStatistics(userId: string) {
    const [total, active, completed, cancelled] = await Promise.all([
      this.goalRepo.countByUser(userId),
      this.goalRepo.countActiveByUser(userId),
      this.goalRepo
        .findByUserAndStatus(userId, 'COMPLETED')
        .then((g) => g.length),
      this.goalRepo
        .findByUserAndStatus(userId, 'CANCELLED')
        .then((g) => g.length),
    ]);

    return {
      total,
      active,
      completed,
      cancelled,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  //PRIVATE HELPER METHODS

  /**
   * Calculate goal progress using Strategy Pattern
   *
   * Steps:
   * 1. Select correct strategy based on goal type
   * 2. Get relevant health data
   * 3. Let strategy calculate progress
   * 4. Return result
   */
  private async calculateGoalProgress(goal: any): Promise<GoalProgress> {
    const strategy = this.strategyFactory.getStrategy(goal.type);

    let healthData;
    if (isTrajectoryGoal(goal.type)) {
      healthData = await this.healthDataRepo.findByUserAndDateRange(
        goal.userId,
        goal.startDate,
        new Date(),
      );
    } else {
      const range = getLastNDaysRange(7);
      healthData = await this.healthDataRepo.findByUserAndDateRange(
        goal.userId,
        range.startDate,
        range.endDate,
      );
    }

    // Different strategies implement different algorithms
    const progress = strategy.calculate(goal, healthData);

    return progress;
  }

  //Validate target value against realistic ranges
  private validateTargetValue(type: GoalType, targetValue: number): void {
    const rules = GOAL_VALIDATION_RULES[type];

    if (!rules) {
      // Goal type not yet implemented
      throw new BadRequestException(`Goal type ${type} is not yet supported`);
    }

    // For weight goals, validate the target weight is reasonable (not too low/high)
    if (type === 'WEIGHT_LOSS' || type === 'WEIGHT_GAIN') {
      if (targetValue < 20 || targetValue > 300) {
        throw new BadRequestException(
          `Target weight must be between 20 and 300 kg`,
        );
      }

      return;
    }

    if (targetValue < rules.min || targetValue > rules.max) {
      throw new BadRequestException(
        `Target value must be between ${rules.min} and ${rules.max} ${rules.unit}`,
      );
    }
  }

  //Validate weight goals specifically
  private validateWeightGoal(
    type: GoalType,
    startWeight: number,
    targetWeight: number,
  ): void {
    if (type === 'WEIGHT_LOSS') {
      // Validate weight loss is reasonable
      const weightToLose = startWeight - targetWeight;

      if (weightToLose <= 0) {
        throw new BadRequestException(
          'Target weight must be less than start weight for weight loss goal',
        );
      }

      const maxLoss = GOAL_VALIDATION_RULES[type].max;
      if (weightToLose > maxLoss) {
        throw new BadRequestException(
          `Maximum safe weight loss is ${maxLoss}kg. Consider setting a more gradual goal.`,
        );
      }

      // Warn if target is too low
      if (targetWeight < 40) {
        throw new BadRequestException(
          'Target weight seems too low. Please consult with a healthcare professional.',
        );
      }
    }

    if (type === 'WEIGHT_GAIN') {
      // Validate weight gain is reasonable
      const weightToGain = targetWeight - startWeight;

      if (weightToGain <= 0) {
        throw new BadRequestException(
          'Target weight must be greater than start weight for weight gain goal',
        );
      }

      const maxGain = GOAL_VALIDATION_RULES[type].max;
      if (weightToGain > maxGain) {
        throw new BadRequestException(
          `Maximum safe weight gain is ${maxGain}kg. Consider setting a more gradual goal.`,
        );
      }
    }
  }
}
