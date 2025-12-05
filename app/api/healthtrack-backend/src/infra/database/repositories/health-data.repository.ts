/**
 * HealthDataRepository - Prisma Implementation (ADAPTER)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthData } from '@prisma/client';
import { IHealthDataRepository } from '@core/repositories/health-data.repository.interface';
import {
  CreateHealthDataDto,
  UpdateHealthDataDto,
  HealthDataWithUser,
  MetricType,
  toDateOnly,
} from '@core/types/health-data.types';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HealthDataRepository implements IHealthDataRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Find by ID
  async findById(id: string): Promise<HealthData | null> {
    return this.prisma.healthData.findUnique({
      where: { id },
    });
  }

  //Find all entries for a user

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<HealthData[]> {
    return this.prisma.healthData.findMany({
      where: { userId },
      orderBy: { date: 'desc' }, // Newest first
      take: options?.limit,
      skip: options?.offset,
    });
  }

  //Find entries within date range
  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HealthData[]> {
    return this.prisma.healthData.findMany({
      where: {
        userId,
        date: {
          gte: toDateOnly(startDate),
          lte: toDateOnly(endDate),
        },
      },
      orderBy: { date: 'asc' }, // Chronological order
    });
  }

  //Find most recent entry
  async findLatestByUser(userId: string): Promise<HealthData | null> {
    return this.prisma.healthData.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 1,
    });
  }

  /**
   * Find entry for specific date
   * Critical for preventing duplicate entries
   *
   * Normalizes date to midnight for accurate matching
   */
  async findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<HealthData | null> {
    const normalizedDate = toDateOnly(date);

    return this.prisma.healthData.findFirst({
      where: {
        userId,
        date: normalizedDate,
      },
    });
  }

  /**
   * Create new entry
   *
   * One entry per user per day
   * Prisma schema has unique constraint on (userId, date) and Will throw if duplicate
   */
  async create(data: CreateHealthDataDto): Promise<HealthData> {
    return this.prisma.healthData.create({
      data: {
        userId: data.userId,
        date: data.date ? toDateOnly(data.date) : toDateOnly(new Date()),
        weight: data.weight,
        height: data.height,
        steps: data.steps,
        calories: data.calories,
        sleep: data.sleep,
        water: data.water,
        exercise: data.exercise,
        heartRate: data.heartRate,
        notes: data.notes,
        mood: data.mood,
      },
    });
  }

  /**
   * Update existing entry
   * Only updates provided fields partial update
   */
  async update(id: string, data: UpdateHealthDataDto): Promise<HealthData> {
    try {
      return await this.prisma.healthData.update({
        where: { id },
        data: {
          weight: data.weight,
          height: data.height,
          steps: data.steps,
          calories: data.calories,
          sleep: data.sleep,
          water: data.water,
          exercise: data.exercise,
          heartRate: data.heartRate,
          notes: data.notes,
          mood: data.mood,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Health data entry with ID ${id} not found`,
        );
      }
      throw error;
    }
  }

  //Delete single entry
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.healthData.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Health data entry with ID ${id} not found`,
        );
      }
      throw error;
    }
  }

  //Delete multiple entries by date range
  async deleteByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.healthData.deleteMany({
      where: {
        userId,
        date: {
          gte: toDateOnly(startDate),
          lte: toDateOnly(endDate),
        },
      },
    });

    return result.count;
  }

  //Calculate average for a specific metric
  async getAverageMetric(
    userId: string,
    metric: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null> {
    // Prisma aggregation
    const result = await this.prisma.healthData.aggregate({
      where: {
        userId,
        date: {
          gte: toDateOnly(startDate),
          lte: toDateOnly(endDate),
        },
        [metric]: {
          not: null, // Only include entries where this metric was logged
        },
      },
      _avg: {
        [metric]: true,
      },
    });

    // Return average, or null if no data
    return result._avg[metric] as number | null;
  }

  /**
   * Count total entries for user
   *
   * Use case: "You've logged 127 days!"
   */
  async countByUser(userId: string): Promise<number> {
    return this.prisma.healthData.count({
      where: { userId },
    });
  }

  /**
   * Find entry with user information
   *
   * Use case: Admin views, detailed logs
   * Includes user relation via Prisma
   */
  async findByIdWithUser(id: string): Promise<HealthDataWithUser | null> {
    return this.prisma.healthData.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }) as Promise<HealthDataWithUser | null>;
  }
}
