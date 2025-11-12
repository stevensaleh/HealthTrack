//HealthService Unit Tests

import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { HealthService } from '../health.service';
import { IHealthDataRepository } from '@core/repositories/health-data.repository.interface';
import { HealthData } from '@prisma/client';

describe('HealthService', () => {
  let service: HealthService;
  let mockHealthDataRepo: jest.Mocked<IHealthDataRepository>;

  // Mock health data for tests
  const mockHealthData: HealthData = {
    id: 'entry-123',
    userId: 'user-123',
    date: new Date('2024-11-07'),
    weight: 75.5,
    height: 175,
    steps: 8432,
    calories: 2100,
    sleep: 7.5,
    water: 2.0,
    exercise: 45,
    heartRate: 72,
    notes: 'Felt great today',
    mood: 'energetic',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock repository
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

    // Create service with mocked repository
    service = new HealthService(mockHealthDataRepo);
  });

  /**
   * TEST GROUP: Logging Health Data
   */
  describe('logHealthData', () => {
    it('should successfully log health data', async () => {
      // Setup: No existing entry for date
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(null);
      mockHealthDataRepo.create.mockResolvedValue(mockHealthData);

      // Act: Log health data
      const result = await service.logHealthData('user-123', {
        weight: 75.5,
        steps: 8432,
        mood: 'energetic',
      });

      // Assert: Entry created
      expect(result).toBeDefined();
      expect(result.weight).toBe(75.5);

      // Verify: Checked for duplicates
      expect(mockHealthDataRepo.findByUserAndDate).toHaveBeenCalled();
      expect(mockHealthDataRepo.create).toHaveBeenCalled();
    });

    it('should reject logging without any metrics', async () => {
      // Act & Assert: Should throw error
      await expect(service.logHealthData('user-123', {})).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.logHealthData('user-123', {})).rejects.toThrow(
        'At least one health metric must be provided',
      );

      // Verify: Didn't try to create
      expect(mockHealthDataRepo.create).not.toHaveBeenCalled();
    });

    it('should reject future dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      // Act & Assert: Should throw error
      await expect(
        service.logHealthData('user-123', {
          date: futureDate,
          weight: 75.0,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.logHealthData('user-123', {
          date: futureDate,
          weight: 75.0,
        }),
      ).rejects.toThrow('Cannot log health data for future dates');
    });

    it('should reject duplicate entry for same date', async () => {
      // Setup: Entry already exists for today
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(mockHealthData);

      // Act & Assert: Should throw ConflictException
      await expect(
        service.logHealthData('user-123', {
          weight: 75.0,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.logHealthData('user-123', {
          weight: 75.0,
        }),
      ).rejects.toThrow('already logged');

      // Verify: Didn't try to create
      expect(mockHealthDataRepo.create).not.toHaveBeenCalled();
    });

    it('should reject invalid weight', async () => {
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(null);

      // Test various invalid weights
      const invalidWeights = [-10, 0, 15, 400]; // Too low or too high

      for (const weight of invalidWeights) {
        await expect(
          service.logHealthData('user-123', { weight }),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('should reject invalid steps', async () => {
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(null);

      // Test invalid steps
      await expect(
        service.logHealthData('user-123', { steps: -100 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.logHealthData('user-123', { steps: 200000 }), // Unrealistic
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid sleep hours', async () => {
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(null);

      // Test invalid sleep
      await expect(
        service.logHealthData('user-123', { sleep: -1 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.logHealthData('user-123', { sleep: 25 }), // More than 24 hours
      ).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * TEST GROUP: Updating Health Data
   */
  describe('updateHealthData', () => {
    it('should successfully update health data', async () => {
      // Setup: Entry exists and belongs to user
      mockHealthDataRepo.findById.mockResolvedValue(mockHealthData);
      const updated = { ...mockHealthData, weight: 74.5 };
      mockHealthDataRepo.update.mockResolvedValue(updated);

      // Act: Update entry
      const result = await service.updateHealthData('user-123', 'entry-123', {
        weight: 74.5,
      });

      // Assert: Entry updated
      expect(result.weight).toBe(74.5);
      expect(mockHealthDataRepo.update).toHaveBeenCalledWith(
        'entry-123',
        expect.objectContaining({ weight: 74.5 }),
      );
    });

    it('should reject update for non-existent entry', async () => {
      // Setup: Entry doesn't exist
      mockHealthDataRepo.findById.mockResolvedValue(null);

      // Act & Assert: Should throw NotFoundException
      await expect(
        service.updateHealthData('user-123', 'non-existent', { weight: 75.0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject update for entry belonging to different user', async () => {
      // Setup: Entry exists but belongs to different user
      const otherUserEntry = { ...mockHealthData, userId: 'other-user' };
      mockHealthDataRepo.findById.mockResolvedValue(otherUserEntry);

      // Act & Assert: Should throw NotFoundException (security)
      await expect(
        service.updateHealthData('user-123', 'entry-123', { weight: 75.0 }),
      ).rejects.toThrow(NotFoundException);

      // Verify: Didn't try to update
      expect(mockHealthDataRepo.update).not.toHaveBeenCalled();
    });

    it('should validate metrics during update', async () => {
      mockHealthDataRepo.findById.mockResolvedValue(mockHealthData);

      // Act & Assert: Should reject invalid weight
      await expect(
        service.updateHealthData('user-123', 'entry-123', { weight: 500 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * TEST GROUP: Analytics and Statistics
   */
  describe('getStatistics', () => {
    it('should calculate correct averages', async () => {
      // Setup: 7 days of data
      const entries: HealthData[] = [];
      for (let i = 0; i < 7; i++) {
        entries.push({
          ...mockHealthData,
          id: `entry-${i}`,
          weight: 75 + i * 0.1, // Increasing weight
          steps: 8000 + i * 100, // Increasing steps
          date: new Date(2024, 10, i + 1),
        });
      }
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue(entries);

      // Act: Get statistics
      const stats = await service.getStatistics(
        'user-123',
        new Date(2024, 10, 1),
        new Date(2024, 10, 7),
      );

      // Assert: Correct calculations
      expect(stats.entriesCount).toBe(7);
      expect(stats.avgWeight).toBeCloseTo(75.3, 1); // Average of 75.0 to 75.6
      expect(stats.avgSteps).toBeCloseTo(8300, 0); // Average of 8000 to 8600
    });

    it('should calculate trends correctly', async () => {
      // Setup: Increasing weight trend
      const entries: HealthData[] = [];
      for (let i = 0; i < 7; i++) {
        entries.push({
          ...mockHealthData,
          id: `entry-${i}`,
          weight: 70 + i * 2.0, // Clear increasing trend
          date: new Date(2024, 10, i + 1),
        });
      }
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue(entries);

      // Act: Get statistics
      const stats = await service.getStatistics(
        'user-123',
        new Date(2024, 10, 1),
        new Date(2024, 10, 7),
      );

      // Assert: Detected increasing trend
      expect(stats.weightTrend).toBe('increasing');
    });

    it('should handle empty data gracefully', async () => {
      // Setup: No entries
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue([]);

      // Act: Get statistics
      const stats = await service.getStatistics(
        'user-123',
        new Date(2024, 10, 1),
        new Date(2024, 10, 7),
      );

      // Assert: Returns structure with no data
      expect(stats.entriesCount).toBe(0);
      expect(stats.avgWeight).toBeUndefined();
      expect(stats.weightTrend).toBeUndefined();
    });

    it('should calculate totals for cumulative metrics', async () => {
      // Setup: 7 days of data
      const entries: HealthData[] = [];
      for (let i = 0; i < 7; i++) {
        entries.push({
          ...mockHealthData,
          id: `entry-${i}`,
          steps: 10000,
          calories: 2000,
          exercise: 30,
          date: new Date(2024, 10, i + 1),
        });
      }
      mockHealthDataRepo.findByUserAndDateRange.mockResolvedValue(entries);

      // Act: Get statistics
      const stats = await service.getStatistics(
        'user-123',
        new Date(2024, 10, 1),
        new Date(2024, 10, 7),
      );

      // Assert: Correct totals
      expect(stats.totalSteps).toBe(70000); // 10000 * 7
      expect(stats.totalCalories).toBe(14000); // 2000 * 7
      expect(stats.totalExercise).toBe(210); // 30 * 7
    });
  });

  /**
   * TEST GROUP: Deleting Health Data
   */
  describe('deleteHealthData', () => {
    it('should successfully delete entry', async () => {
      // Setup: Entry exists and belongs to user
      mockHealthDataRepo.findById.mockResolvedValue(mockHealthData);

      // Act: Delete entry
      await service.deleteHealthData('user-123', 'entry-123');

      // Verify: Delete called
      expect(mockHealthDataRepo.delete).toHaveBeenCalledWith('entry-123');
    });

    it('should prevent deleting other users data', async () => {
      // Setup: Entry belongs to different user
      const otherUserEntry = { ...mockHealthData, userId: 'other-user' };
      mockHealthDataRepo.findById.mockResolvedValue(otherUserEntry);

      // Act & Assert: Should throw NotFoundException (security)
      await expect(
        service.deleteHealthData('user-123', 'entry-123'),
      ).rejects.toThrow(NotFoundException);

      // Verify: Didn't try to delete
      expect(mockHealthDataRepo.delete).not.toHaveBeenCalled();
    });
  });

  /**
   * TEST GROUP: Helper Methods
   */
  describe('hasLoggedToday', () => {
    it('should return true if logged today', async () => {
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(mockHealthData);

      const result = await service.hasLoggedToday('user-123');

      expect(result).toBe(true);
    });

    it('should return false if not logged today', async () => {
      mockHealthDataRepo.findByUserAndDate.mockResolvedValue(null);

      const result = await service.hasLoggedToday('user-123');

      expect(result).toBe(false);
    });
  });

  describe('getTotalDaysTracked', () => {
    it('should return correct count', async () => {
      mockHealthDataRepo.countByUser.mockResolvedValue(127);

      const result = await service.getTotalDaysTracked('user-123');

      expect(result).toBe(127);
      expect(mockHealthDataRepo.countByUser).toHaveBeenCalledWith('user-123');
    });
  });
});
