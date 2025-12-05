/**
 * IUserRepository - User Repository Interface
 */

import { User } from '@prisma/client';
import {
  CreateUserData,
  UpdateUserData,
  UserWithRelations,
} from '../types/user.types';

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by Google OAuth ID
   */
  findByGoogleId(googleId: string): Promise<User | null>;

  /**
   * Check if email already exists in database
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Create a new userer
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Update existing user
   */
  update(id: string, data: UpdateUserData): Promise<User>;

  /**
   * Delete user (hard delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Find user with all related data (goals, health data, integrations)
   */
  findByIdWithRelations(id: string): Promise<UserWithRelations | null>;
}
