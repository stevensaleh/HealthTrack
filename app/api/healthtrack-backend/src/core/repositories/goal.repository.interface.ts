/**
 * IGoalRepository - Goal Repository Interface (PORT)
 *
 * This interface defines operations for goal management.
 */

import { Goal, GoalType, GoalStatus } from '@prisma/client';
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalWithUser,
} from '@core/types/goal.types';

export interface IGoalRepository {
  //Find goal by ID
  findById(id: string): Promise<Goal | null>;

  //Find all goals for a user
  findByUserId(userId: string): Promise<Goal[]>;

  //Find active goals for a user
  findActiveByUser(userId: string): Promise<Goal[]>;

  //Find goals by user and status
  findByUserAndStatus(userId: string, status: GoalStatus): Promise<Goal[]>;

  //Find goals by user and type
  findByUserAndType(userId: string, type: GoalType): Promise<Goal[]>;

  //Find active goal by user and type (for conflict detection)
  findActiveByTypeAndUser(userId: string, type: GoalType): Promise<Goal | null>;

  //Create new goal
  create(data: CreateGoalDto): Promise<Goal>;

  //Update existing goal
  update(id: string, data: UpdateGoalDto): Promise<Goal>;

  //Delete goal
  delete(id: string): Promise<void>;

  //Find goal with user information
  findByIdWithUser(id: string): Promise<GoalWithUser | null>;

  //Count total goals for user
  countByUser(userId: string): Promise<number>;

  //Count active goals for user
  countActiveByUser(userId: string): Promise<number>;
}
