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
  googleId?: string;
  email?: string;
  password?: string;
};

/**
 * UserResponse - Safe user data for API responses
 * Used when: Returning user data to frontend
 */
export type UserResponse = Omit<User, 'password' | 'googleId'>;

/**
 * UserWithRelations - User with all related data
 */
export type UserWithRelations = User & {
  healthData: any[];
  goals: any[];
  integrations: any[];
};

/**
 * Helper function to convert User to UserResponse
 */
export function toUserResponse(user: User): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, googleId, ...safeUser } = user;
  return safeUser;
}
