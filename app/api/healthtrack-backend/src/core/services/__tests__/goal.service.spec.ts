//GoalService Unit Tests

import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GoalService } from '../goal.service';
import { IGoalRepository } from '@core/repositories/goal.repository.interface';
import { IHealthDataRepository } from '@core/repositories/health-data.repository.interface';
import { GoalCalculationStrategyFactory } from '@core/strategies/goal-calculation-strategy.factory';
import { WeightLossStrategy } from '@core/strategies/weight-loss.strategy';
import { WeightGainStrategy } from '@core/strategies/weight-gain.strategy';
import { StepsStrategy } from '@core/strategies/steps.strategy';
import { ExerciseStrategy } from '@core/strategies/exercise.strategy';
import { Goal, HealthData } from '@prisma/client';

describe('GoalService', () => {
  let service: GoalService;
  let mockGoalRepo: jest.Mocked<IGoalRepository>;
  let mockHealthDataRepo: jest.Mocked<IHealthDataRepository>;
  let strategyFactory: GoalCalculationStrategyFactory;

  // Mock data
  const mockGoal: Goal = {
    id: 'goal-123',
    userId: 'user-123',
    type: 'WEIGHT_LOSS',
    title: 'Lose 5kg',
    description: 'Summer fitness goal',
    targetValue: 75,
    startValue: 80,
    startDate: new Date('2024-11-01'),
    endDate: new Date('2025-02-01'),
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHealthData: HealthData = {
    id: 'health-123',
    userId: 'user-123',
    date: new Date('2024-11-07'),
    weight: 78,
    height: 175,
    steps: 8500,
    calories: 2100,
    sleep: 7.5,
    water: 2.0,
    exercise: 45,
    heartRate: 72,
    notes: null,
    mood: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock repositories
    mockGoalRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUser: jest.fn(),
      findByUserAndStatus: jest.fn(),
      findByUserAndType: jest.fn(),
      findActiveByTypeAndUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithUser: jest.fn(),
      countByUser: jest.fn(),
      countActiveByUser: jest.fn(),
    } as jest.Mocked<IGoalRepository>;

    mockHealthDataRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserAndDateRange: jest.fn(),
      findLatestByUser: jest.fn(),
      findByUserAndDate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByUserAndDateRange: jest.fn(),
      getAverageMetric: jest.fn(),
      countByUser: jest.fn(),
      findByIdWithUser: jest.fn(),
    } as jest.Mocked<IHealthDataRepository>;

    // Create real strategies and factory
    const weightLossStrategy = new WeightLossStrategy();
    const weightGainStrategy = new WeightGainStrategy();
    const stepsStrategy = new StepsStrategy();
    const exerciseStrategy = new ExerciseStrategy();

    strategyFactory = new GoalCalculationStrategyFactory(
      weightLossStrategy,
      weightGainStrategy,
      stepsStrategy,
      exerciseStrategy,
    );

    // Create service with mocked repos and real strategies
    service = new GoalService(
      mockGoalRepo,
      mockHealthDataRepo,
      strategyFactory,
    );
  });

  /**
   * TEST GROUP: Goal Creation
   */
  describe('createGoal', () => {
    // Helper to create future dates
    const getFutureDate = (daysFromNow: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date;
    };

    it('should successfully create a goal', async () => {
      // Setup: No conflicting goal exists
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(null);
      mockHealthDataRepo.findLatestByUser.mockResolvedValue(mockHealthData);
      mockGoalRepo.create.mockResolvedValue(mockGoal);

      // Act: Create goal
      const result = await service.createGoal('user-123', {
        type: 'WEIGHT_LOSS',
        title: 'Lose 5kg',
        targetValue: 75,
        startValue: 80,
        endDate: getFutureDate(90), // 90 days from now
      });

      // Assert: Goal created
      expect(result).toBeDefined();
      expect(result.type).toBe('WEIGHT_LOSS');

      // Verify: Checked for conflicts
      expect(mockGoalRepo.findActiveByTypeAndUser).toHaveBeenCalledWith(
        'user-123',
        'WEIGHT_LOSS',
      );
      expect(mockGoalRepo.create).toHaveBeenCalled();
    });

    it('should reject duplicate active goal of same type', async () => {
      // Setup: Active weight loss goal already exists
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(mockGoal);

      // Act & Assert: Should throw ConflictException
      await expect(
        service.createGoal('user-123', {
          type: 'WEIGHT_LOSS',
          title: 'Another weight loss goal',
          targetValue: 70,
          endDate: getFutureDate(90),
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createGoal('user-123', {
          type: 'WEIGHT_LOSS',
          title: 'Another weight loss goal',
          targetValue: 70,
          endDate: getFutureDate(90),
        }),
      ).rejects.toThrow('already have an active');

      // Verify: Didn't try to create
      expect(mockGoalRepo.create).not.toHaveBeenCalled();
    });

    it('should reject invalid target values', async () => {
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(null);

      // Test steps out of range
      await expect(
        service.createGoal('user-123', {
          type: 'STEPS',
          title: 'Too many steps',
          targetValue: 100000, // Over max
          endDate: getFutureDate(30),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject end date before start date', async () => {
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(null);

      const pastDate = new Date('2024-01-01'); // Definitely in past

      await expect(
        service.createGoal('user-123', {
          type: 'STEPS',
          title: 'Invalid date goal',
          targetValue: 10000,
          endDate: pastDate,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createGoal('user-123', {
          type: 'STEPS',
          title: 'Invalid date goal',
          targetValue: 10000,
          endDate: pastDate,
        }),
      ).rejects.toThrow('after start date');
    });

    it('should auto-fill start value for weight goals', async () => {
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(null);
      mockHealthDataRepo.findLatestByUser.mockResolvedValue(mockHealthData);
      mockGoalRepo.create.mockResolvedValue(mockGoal);

      // Act: Create weight goal without start value
      await service.createGoal('user-123', {
        type: 'WEIGHT_LOSS',
        title: 'Lose weight',
        targetValue: 75,
        // No startValue provided
        endDate: getFutureDate(90),
      });

      // Verify: Used current weight from health data
      expect(mockHealthDataRepo.findLatestByUser).toHaveBeenCalled();
      expect(mockGoalRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startValue: 78, // From mockHealthData
        }),
      );
    });

    it('should reject weight goal without health data', async () => {
      mockGoalRepo.findActiveByTypeAndUser.mockResolvedValue(null);
      mockHealthDataRepo.findLatestByUser.mockResolvedValue(null);

      await expect(
        service.createGoal('user-123', {
          type: 'WEIGHT_LOSS',
          title: 'Lose weight',
          targetValue: 75,
          endDate: getFutureDate(90),
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createGoal('user-123', {
          type: 'WEIGHT_LOSS',
          title: 'Lose weight',
          targetValue: 75,
          endDate: getFutureDate(90),
        }),
      ).rejects.toThrow('log your current weight');
    });
  });

  /**
   * TEST GROUP: Progress Calculation (Strategy Pattern!)
   */
  describe('getGoalWithProgress', () => {
    it('should calculate weight loss progress correctly', async () => {
      // Setup: Goal exists, health data shows progress
      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue([
        mockHealthData,
      ]);

      // Act: Get goal with progress
      const result = await service.getGoalWithProgress('user-123', 'goal-123');

      // Assert: Progress calculated
      expect(result.progress).toBeDefined();
      expect(result.progress.percentage).toBeGreaterThan(0);

      // Weight loss: (80 - 78) / (80 - 75) = 2/5 = 40%
      expect(result.progress.percentage).toBeCloseTo(40, 0);
      expect(result.progress.currentValue).toBe(78);
      expect(result.progress.targetValue).toBe(75);
    });

    it('should use correct strategy for each goal type', async () => {
      // Test different goal types use different strategies

      // Weight Loss
      const weightLossGoal = { ...mockGoal, type: 'WEIGHT_LOSS' as any };
      mockGoalRepo.findById.mockResolvedValue(weightLossGoal);
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue([
        mockHealthData,
      ]);

      const weightLossResult = await service.getGoalWithProgress(
        'user-123',
        'goal-123',
      );
      expect(weightLossResult.progress.startValue).toBeDefined(); // Trajectory goal

      // Steps (daily goal)
      const stepsGoal = {
        ...mockGoal,
        type: 'STEPS' as any,
        targetValue: 10000,
      };
      mockGoalRepo.findById.mockResolvedValue(stepsGoal);

      const stepsResult = await service.getGoalWithProgress(
        'user-123',
        'goal-123',
      );
      expect(stepsResult.progress.startValue).toBeUndefined(); // Not a trajectory goal
    });
  });

  /**
   * TEST GROUP: Status Transitions
   */
  describe('goal status management', () => {
    it('should complete an active goal', async () => {
      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockGoalRepo.update.mockResolvedValue({
        ...mockGoal,
        status: 'COMPLETED',
      });

      const result = await service.completeGoal('user-123', 'goal-123');

      expect(mockGoalRepo.update).toHaveBeenCalledWith('goal-123', {
        status: 'COMPLETED',
      });
    });

    it('should reject completing non-active goal', async () => {
      const completedGoal = { ...mockGoal, status: 'COMPLETED' as any };
      mockGoalRepo.findById.mockResolvedValue(completedGoal);

      await expect(
        service.completeGoal('user-123', 'goal-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pause an active goal', async () => {
      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockGoalRepo.update.mockResolvedValue({ ...mockGoal, status: 'PAUSED' });

      await service.pauseGoal('user-123', 'goal-123');

      expect(mockGoalRepo.update).toHaveBeenCalledWith('goal-123', {
        status: 'PAUSED',
      });
    });

    it('should resume a paused goal', async () => {
      const pausedGoal = { ...mockGoal, status: 'PAUSED' as any };
      mockGoalRepo.findById.mockResolvedValue(pausedGoal);
      mockGoalRepo.update.mockResolvedValue({ ...mockGoal, status: 'ACTIVE' });

      await service.resumeGoal('user-123', 'goal-123');

      expect(mockGoalRepo.update).toHaveBeenCalledWith('goal-123', {
        status: 'ACTIVE',
      });
    });

    it('should cancel an active goal', async () => {
      mockGoalRepo.findById.mockResolvedValue(mockGoal);
      mockGoalRepo.update.mockResolvedValue({
        ...mockGoal,
        status: 'CANCELLED',
      });

      await service.cancelGoal('user-123', 'goal-123');

      expect(mockGoalRepo.update).toHaveBeenCalledWith('goal-123', {
        status: 'CANCELLED',
      });
    });
  });

  /**
   * TEST GROUP: Security (User Isolation)
   */
  describe('security - user isolation', () => {
    it('should prevent accessing other users goals', async () => {
      const otherUserGoal = { ...mockGoal, userId: 'other-user' };
      mockGoalRepo.findById.mockResolvedValue(otherUserGoal);

      await expect(
        service.getGoalWithProgress('user-123', 'goal-123'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.completeGoal('user-123', 'goal-123'),
      ).rejects.toThrow(NotFoundException);

      await expect(service.deleteGoal('user-123', 'goal-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * TEST GROUP: Goal Statistics
   */
  describe('getGoalStatistics', () => {
    it('should calculate statistics correctly', async () => {
      mockGoalRepo.countByUser.mockResolvedValue(10);
      mockGoalRepo.countActiveByUser.mockResolvedValue(3);
      mockGoalRepo.findByUserAndStatus.mockImplementation((userId, status) => {
        if (status === 'COMPLETED')
          return Promise.resolve([{}, {}, {}, {}] as any);
        if (status === 'CANCELLED') return Promise.resolve([{}, {}] as any);
        return Promise.resolve([]);
      });

      const stats = await service.getGoalStatistics('user-123');

      expect(stats.total).toBe(10);
      expect(stats.active).toBe(3);
      expect(stats.completed).toBe(4);
      expect(stats.cancelled).toBe(2);
      expect(stats.completionRate).toBe(40); // 4/10 = 40%
    });
  });
});

/**
 * TEST GROUP: Strategy Pattern Tests
 * Testing each strategy independently
 */
describe('Goal Calculation Strategies', () => {
  const mockGoal: Goal = {
    id: 'goal-123',
    userId: 'user-123',
    type: 'WEIGHT_LOSS',
    title: 'Test Goal',
    description: null,
    targetValue: 75,
    startValue: 80,
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-01'),
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('WeightLossStrategy', () => {
    let strategy: WeightLossStrategy;

    beforeEach(() => {
      strategy = new WeightLossStrategy();
    });

    it('should calculate progress correctly', () => {
      const healthData: HealthData[] = [
        {
          id: 'health-123',
          userId: 'user-123',
          date: new Date(),
          weight: 78,
          height: null,
          steps: null,
          calories: null,
          sleep: null,
          water: null,
          exercise: null,
          heartRate: null,
          notes: null,
          mood: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const progress = strategy.calculate(mockGoal, healthData);

      // (80 - 78) / (80 - 75) = 2/5 = 40%
      expect(progress.percentage).toBeCloseTo(40, 0);
      expect(progress.currentValue).toBe(78);
      expect(progress.targetValue).toBe(75);
      expect(progress.startValue).toBe(80);
    });

    it('should detect goal completion', () => {
      const healthData: HealthData[] = [
        {
          id: 'health-123',
          userId: 'user-123',
          date: new Date(),
          weight: 75, // Reached target!
          height: null,
          steps: null,
          calories: null,
          sleep: null,
          water: null,
          exercise: null,
          heartRate: null,
          notes: null,
          mood: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const progress = strategy.calculate(mockGoal, healthData);

      expect(progress.percentage).toBeGreaterThanOrEqual(100);
      expect(progress.status).toBe('completed');
    });

    it('should support the correct goal type', () => {
      expect(strategy.supports('WEIGHT_LOSS')).toBe(true);
      expect(strategy.supports('STEPS')).toBe(false);
    });
  });

  describe('StepsStrategy', () => {
    let strategy: StepsStrategy;

    beforeEach(() => {
      strategy = new StepsStrategy();
    });

    it('should calculate daily progress correctly', () => {
      const stepsGoal = {
        ...mockGoal,
        type: 'STEPS' as any,
        targetValue: 10000,
      };
      const healthData: HealthData[] = [
        {
          id: 'health-123',
          userId: 'user-123',
          date: new Date(),
          weight: null,
          height: null,
          steps: 8500, // 85% of target
          calories: null,
          sleep: null,
          water: null,
          exercise: null,
          heartRate: null,
          notes: null,
          mood: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const progress = strategy.calculate(stepsGoal, healthData);

      expect(progress.percentage).toBeCloseTo(85, 0);
      expect(progress.currentValue).toBe(8500);
      expect(progress.targetValue).toBe(10000);
    });
  });
});
