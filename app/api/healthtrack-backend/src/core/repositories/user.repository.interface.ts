/**
 * IUserRepository - User Repository Interface (PORT)
 * This interface defines WHAT operations we can perform on users,
 * but NOT HOW they are implemented.
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
   * Use case: Get user profile, verify user exists
   * Returns: User object or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email address
   * Use case: Login, check if email exists during registration
   * Returns: User object or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by Google OAuth ID
   * Use case: Google login - check if this Google account is connected
   * Returns: User object or null if not connected
   */
  findByGoogleId(googleId: string): Promise<User | null>;

  /**
   * Check if email already exists in database
   * Use case: Registration validation
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Create a new user
   * Use case: User registration (email/password or OAuth)
   * Returns: Newly created user
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Update existing user
   * Use case: Profile editing, linking OAuth account
   * Returns: Updated user
   */
  update(id: string, data: UpdateUserData): Promise<User>;

  /**
   * Delete user (hard delete)
   * Use case: Account deletion, GDPR compliance
   * Returns: void
   */
  delete(id: string): Promise<void>;

  /**
   * Find user with all related data (goals, health data, integrations)
   * Use case: Dashboard view, full profile page
   * Returns: User with all relations or null
   */
  findByIdWithRelations(id: string): Promise<UserWithRelations | null>;
}
