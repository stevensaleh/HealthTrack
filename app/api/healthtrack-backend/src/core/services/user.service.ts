/**
 * UserService - Business Logic Layer
 * This service contains all business rules and orchestration for user operations.
 */

import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';
import type { IUserRepository } from '../repositories/user.repository.interface';
import {
  //CreateUserData,
  //UpdateUserData,
  UserResponse,
  toUserResponse,
} from '../types/user.types';

//DTOs for service methods
export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleProfileDto {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

@Injectable()
export class UserService {
  //Constructor with Dependency Injection
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  /**
   * Register new user with email/password
   * @throws ConflictException if email already exists
   * @throws BadRequestException if password too weak
   */
  async register(data: RegisterDto): Promise<UserResponse> {
    // Business Rule 1: Email must be unique
    const emailExists = await this.userRepo.existsByEmail(data.email);
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    // Business Rule 2: Password strength validation
    this.validatePasswordStrength(data.password);

    // Business Logic: Hash password (security best practice)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user via repository
    const user = await this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // Return safe data (exclude password)
    return toUserResponse(user);
  }

  /**
   * Login with email/password
   * User must exist
   * Password must match
   * User must have password (not OAuth-only user)
   * @throws UnauthorizedException if credentials invalid
   */
  async login(data: LoginDto): Promise<UserResponse> {
    // Find user
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      // Security: Don't reveal if email exists or not
      throw new UnauthorizedException('Invalid credentials');
    }

    // Business Rule: OAuth users don't have passwords
    if (!user.password) {
      throw new UnauthorizedException('Please login with Google');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return safe data
    return toUserResponse(user);
  }

  /**
   * Login or register with Google OAuth
   * Complex business logic with multiple paths:
   * This demonstrates service orchestration - multiple repository calls,
   * business decisions, complex workflows
   */
  async loginWithGoogle(profile: GoogleProfileDto): Promise<UserResponse> {
    // Try to find user by Google ID
    let user = await this.userRepo.findByGoogleId(profile.googleId);

    if (user) {
      // User exists with Google linked
      // Update profile image if it changed
      if (user.profileImage !== profile.profileImage) {
        user = await this.userRepo.update(user.id, {
          profileImage: profile.profileImage,
        });
      }
      return toUserResponse(user);
    }

    // Check if email already exists (user registered with email/password)
    const existingUser = await this.userRepo.findByEmail(profile.email);

    if (existingUser) {
      // Link Google account to existing user
      user = await this.userRepo.update(existingUser.id, {
        googleId: profile.googleId,
        profileImage:
          profile.profileImage ?? existingUser.profileImage ?? undefined,
        // Keep existing name if Google doesn't provide one
        firstName: profile.firstName ?? existingUser.firstName ?? undefined,
        lastName: profile.lastName ?? existingUser.lastName ?? undefined,
      });
      return toUserResponse(user);
    }

    // New user - create from Google profile
    user = await this.userRepo.create({
      email: profile.email,
      googleId: profile.googleId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImage: profile.profileImage,
      // No password - OAuth user
    });

    return toUserResponse(user);
  }

  /**
   * Get user by ID
   * Simple operation - just delegates to repository
   * @throws NotFoundException if user doesn't exist
   */
  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }

  /**
   * Update user profile
   * User must exist
   * Input must be sanitized (XSS prevention)
   * @throws NotFoundException if user doesn't exist
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UserResponse> {
    // User must exist
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sanitize input (prevent XSS attacks)
    const sanitizedData = this.sanitizeProfileData(data);

    // Update via repository
    const updatedUser = await this.userRepo.update(userId, sanitizedData);

    return toUserResponse(updatedUser);
  }

  //Delete user account
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.delete(userId);
  }

  /**
   * Check if email is available
   * Used during registration to provide real-time feedback
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    const exists = await this.userRepo.existsByEmail(email);
    return !exists;
  }

  /**
   * Change user password
   * @throws NotFoundException if user doesn't exist
   * @throws UnauthorizedException if current password is incorrect
   * @throws BadRequestException if new password is weak or same as current
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get user
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new BadRequestException(
        'Cannot change password for OAuth-only accounts',
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepo.update(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Delete user (alias for deleteAccount)
   */
  async deleteUser(userId: string): Promise<void> {
    return this.deleteAccount(userId);
  }

  //PRIVATE HELPER METHODS

  /**
   * Validate password strength
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * @throws BadRequestException if password too weak
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }
  }

  /**
   * Sanitize profile data to prevent XSS attacks
   * Strip HTML tags, trim whitespace
   */
  // private sanitizeProfileData(data: UpdateProfileDto): UpdateProfileDto {
  //   const stripHtml = (text: string | undefined): string | undefined => {
  //     if (!text) return text;
  //     // Remove all HTML tags
  //     return text.replace(/<[^>]*>/g, '').trim();
  //   };

  //   return {
  //     firstName: stripHtml(data.firstName),
  //     lastName: stripHtml(data.lastName),
  //     profileImage: data.profileImage?.trim(),
  //   };
  // }
  private sanitizeProfileData(data: UpdateProfileDto): UpdateProfileDto {
    const clean = (text: string | undefined): string | undefined => {
      if (!text) return text;

      // Cast sanitizeHtml to a known function signature to avoid `error`-typed value issues,
      // then ensure the result is a string before calling .trim().
      const sanitizer = sanitizeHtml as unknown as (
        input: string,
        options?: {
          allowedTags?: string[];
          allowedAttributes?: Record<string, unknown>;
        },
      ) => unknown;

      const raw = sanitizer(text, { allowedTags: [], allowedAttributes: {} });

      if (typeof raw === 'string') {
        return raw.trim();
      }

      // If sanitizer returns something unexpected fall back to a safe stripped string.
      return String(raw).trim();
    };

    return {
      firstName: clean(data.firstName),
      lastName: clean(data.lastName),
      profileImage: data.profileImage?.trim(),
    };
  }
}
