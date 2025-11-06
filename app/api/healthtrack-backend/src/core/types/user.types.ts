/**
 * User Type Definitions
 * These types define the shape of data for User operations.
 */

import { User } from '@prisma/client';

/**
 * CreateUserData - Data needed to create a new user
 * Used when: Registering new users (email/password or OAuth)
 */
export type CreateUserData = {
  email: string;
  password?: string; // Optional - OAuth users don't have passwords
  firstName?: string;
  lastName?: string;
  googleId?: string; // For Google OAuth login
  profileImage?: string;
};

/**
 * UpdateUserData - Data that can be updated after user creation
 * Used when: User edits their profile
 */
export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  googleId?: string; // For linking OAuth account later
};

/**
 * UserResponse - Safe user data for API responses
 * Used when: Returning user data to frontend
 * prevents accidental data leaks
 */
export type UserResponse = Omit<User, 'password' | 'googleId'>;

/**
 * UserWithRelations - User with all related data
 * Useful for dashboard views where we need everything at once
 */
export type UserWithRelations = User & {
  healthData: any[]; // Will be typed properly when we implement HealthData
  goals: any[]; // Will be typed properly when we implement Goal
  integrations: any[]; // Will be typed properly when we implement Integration
};

/**
 * Helper function to convert User to UserResponse
 * Strips sensitive fields
 */
export function toUserResponse(user: User): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, googleId, ...safeUser } = user;
  return safeUser;
}
