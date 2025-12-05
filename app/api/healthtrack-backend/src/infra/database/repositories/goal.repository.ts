/**
 * GoalRepository - Prisma Implementation (ADAPTER)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Goal, GoalType, GoalStatus } from '@prisma/client';
import { IGoalRepository } from '@core/repositories/goal.repository.interface';
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalWithUser,
} from '@core/types/goal.types';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GoalRepository implements IGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Find by ID
  async findById(id: string): Promise<Goal | null> {
    return this.prisma.goal.findUnique({
      where: { id },
    });
  }

  /**
   * Find all goals for user
   * Ordered by creation date (newest first)
   */
  async findByUserId(userId: string): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find active goals only
   * Uses index on (userId, status) for performance
   */
  async findActiveByUser(userId: string): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find goals by status
   * Useful for filtering (show completed, cancelled, etc.)
   */
  async findByUserAndStatus(
    userId: string,
    status: GoalStatus,
  ): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: {
        userId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find goals by type
   * View all weight loss goals (active or not)
   */
  async findByUserAndType(userId: string, type: GoalType): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find active goal by type
   * Critical for conflict detection
   * Business Rule: Only one active goal per type allowed
   */
  async findActiveByTypeAndUser(
    userId: string,
    type: GoalType,
  ): Promise<Goal | null> {
    return this.prisma.goal.findFirst({
      where: {
        userId,
        type,
        status: 'ACTIVE',
      },
    });
  }

  //Create new goal
  async create(data: CreateGoalDto): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        startValue: data.startValue,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'ACTIVE', // New goals start as active
      },
    });
  }

  //Update existing goal
  async update(id: string, data: UpdateGoalDto): Promise<Goal> {
    try {
      return await this.prisma.goal.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          targetValue: data.targetValue,
          endDate: data.endDate,
          status: data.status,
        },
      });
    } catch (error : any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Goal with ID ${id} not found`);
      }
      throw error;
    }
  }

  //Delete goal
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.goal.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Goal with ID ${id} not found`);
      }
      throw error;
    }
  }

  //Find goal with user information
  async findByIdWithUser(id: string): Promise<GoalWithUser | null> {
    return this.prisma.goal.findUnique({
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
    }) as Promise<GoalWithUser | null>;
  }

  //Count total goals
  async countByUser(userId: string): Promise<number> {
    return this.prisma.goal.count({
      where: { userId },
    });
  }

  //Count active goals only
  async countActiveByUser(userId: string): Promise<number> {
    return this.prisma.goal.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });
  }
}
