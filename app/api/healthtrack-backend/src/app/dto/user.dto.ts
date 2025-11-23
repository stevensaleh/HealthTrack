/**
 * User DTOs (Data Transfer Objects)
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO for user registration
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'User password (min 8 characters, must contain uppercase, lowercase, and number)',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;
}

/**
 * DTO for user login
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * DTO for Google OAuth
 */
export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token from OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  googleIdToken: string;
}

/**
 * Response DTO for user (safe, no password)
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'Google ID if signed up via Google',
    example: '1234567890',
  })
  googleId?: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T12:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Response DTO for authentication (includes token)
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiPropertyOptional({
    description: 'Token type',
    example: 'Bearer',
    default: 'Bearer',
  })
  tokenType?: string;

  @ApiPropertyOptional({
    description: 'Token expiration time in seconds',
    example: 86400,
  })
  expiresIn?: number;
}

/**
 * DTO for updating user profile
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated first name',
    example: 'Jane',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Updated last name',
    example: 'Smith',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Updated profile image URL',
    example: 'https://example.com/new-avatar.jpg',
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}

/**
 * DTO for changing password
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPassword123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description:
      'New password (min 8 characters, must contain uppercase, lowercase, and number)',
    example: 'NewPassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}

/**
 * Response DTO for password change
 */
export class PasswordChangeResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password changed successfully',
  })
  message: string;
}

/**
 * Response DTO for account deletion
 */
export class DeleteAccountResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Account deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'ID of deleted user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;
}

/**
 * Response DTO for user stats
 */
export class UserStatsResponseDto {
  @ApiProperty({
    description: 'Number of health data entries',
    example: 127,
  })
  healthDataCount: number;

  @ApiProperty({
    description: 'Number of active goals',
    example: 3,
  })
  activeGoalsCount: number;

  @ApiProperty({
    description: 'Number of completed goals',
    example: 5,
  })
  completedGoalsCount: number;

  @ApiProperty({
    description: 'Number of connected integrations',
    example: 2,
  })
  integrationsCount: number;

  @ApiProperty({
    description: 'Account age in days',
    example: 180,
  })
  accountAgeDays: number;

  @ApiPropertyOptional({
    description: 'Current streak of consecutive days with health data',
    example: 7,
  })
  currentStreak?: number;

  @ApiPropertyOptional({
    description: 'Longest streak of consecutive days',
    example: 21,
  })
  longestStreak?: number;
}
