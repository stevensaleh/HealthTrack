//UserService Unit Tests

import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { IUserRepository } from '../../repositories/user.repository.interface';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  // Mock user data for tests
  const mockUser: User = {
    id: 'user-123',
    email: 'john@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    googleId: null,
    profileImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create mock repository with all interface methods
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithRelations: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    // Create service with mocked repository
    service = new UserService(mockUserRepo);

    // Mock bcrypt functions
    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  /**
   * TEST GROUP: User Registration
   */
  describe('register', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'Password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should successfully register a new user', async () => {
      // Setup: Email doesn't exist
      mockUserRepo.existsByEmail.mockResolvedValue(false);
      mockUserRepo.create.mockResolvedValue(mockUser);

      // Act: Register user
      const result = await service.register(registerData);

      // Assert: User created successfully
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.password).toBeUndefined(); // Password excluded from response

      // Verify: Repository methods called correctly
      expect(mockUserRepo.existsByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: 'hashed_password',
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });

      // Verify: Password was hashed
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
    });

    it('should reject registration with duplicate email', async () => {
      // Setup: Email already exists
      mockUserRepo.existsByEmail.mockResolvedValue(true);

      // Act & Assert: Should throw ConflictException
      await expect(service.register(registerData)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerData)).rejects.toThrow(
        'Email already in use',
      );

      // Verify: Didn't try to create user
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should reject weak passwords', async () => {
      // Setup: Email available
      mockUserRepo.existsByEmail.mockResolvedValue(false);

      // Test various weak passwords
      const weakPasswords = [
        'short', // Too short
        'alllowercase1', // No uppercase
        'ALLUPPERCASE1', // No lowercase
        'NoNumbers', // No numbers
      ];

      for (const weakPassword of weakPasswords) {
        await expect(
          service.register({ ...registerData, password: weakPassword }),
        ).rejects.toThrow(BadRequestException);
      }

      // Verify: Never created user
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  /**
   * TEST GROUP: User Login
   */
  describe('login', () => {
    const loginData = {
      email: 'john@example.com',
      password: 'Password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Setup: User exists with password
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act: Login
      const result = await service.login(loginData);

      // Assert: Returns user data
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.password).toBeUndefined(); // Password excluded

      // Verify: Checked password
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
    });

    it('should reject login with non-existent email', async () => {
      // Setup: User doesn't exist
      mockUserRepo.findByEmail.mockResolvedValue(null);

      // Act & Assert: Should throw UnauthorizedException
      await expect(service.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should reject login with wrong password', async () => {
      // Setup: User exists but password doesn't match
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert: Should throw UnauthorizedException
      await expect(service.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should reject login for OAuth-only users', async () => {
      // Setup: User exists but has no password (OAuth user)
      const oauthUser = { ...mockUser, password: null };
      mockUserRepo.findByEmail.mockResolvedValue(oauthUser);

      // Act & Assert: Should tell user to use Google
      await expect(service.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Please login with Google',
      );
    });
  });

  /**
   * TEST GROUP: Google OAuth Login
   *
   * This tests complex business logic with multiple paths
   */
  describe('loginWithGoogle', () => {
    const googleProfile = {
      googleId: 'google-123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImage: 'https://example.com/photo.jpg',
    };

    it('should login existing user with Google linked', async () => {
      // Setup: User already has Google linked (with same profile image)
      const userWithGoogle = {
        ...mockUser,
        googleId: googleProfile.googleId,
        profileImage: googleProfile.profileImage, // Same image, so no update needed
      };
      mockUserRepo.findByGoogleId.mockResolvedValue(userWithGoogle);

      // Act: Login with Google
      const result = await service.loginWithGoogle(googleProfile);

      // Assert: Returns existing user
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);

      // Verify: Checked for Google ID first
      expect(mockUserRepo.findByGoogleId).toHaveBeenCalledWith(
        googleProfile.googleId,
      );

      // Verify: Should NOT update (image is same)
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should update profile image if changed', async () => {
      // Setup: User exists but has different profile image
      const userWithOldImage = { ...mockUser, profileImage: 'old-image.jpg' };
      mockUserRepo.findByGoogleId.mockResolvedValue(userWithOldImage);
      mockUserRepo.update.mockResolvedValue({
        ...userWithOldImage,
        profileImage: googleProfile.profileImage,
      });

      // Act: Login with Google
      await service.loginWithGoogle(googleProfile);

      // Verify: Updated profile image
      expect(mockUserRepo.update).toHaveBeenCalledWith(userWithOldImage.id, {
        profileImage: googleProfile.profileImage,
      });
    });

    it('should link Google to existing email account', async () => {
      // Setup: No Google link, but email exists (user registered with password)
      mockUserRepo.findByGoogleId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        googleId: googleProfile.googleId,
      });

      // Act: Login with Google
      const result = await service.loginWithGoogle(googleProfile);

      // Verify: Linked Google account to existing user
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ googleId: googleProfile.googleId }),
      );
    });

    it('should create new user from Google profile', async () => {
      // Setup: Brand new user
      mockUserRepo.findByGoogleId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        ...mockUser,
        googleId: googleProfile.googleId,
      });

      // Act: Login with Google
      await service.loginWithGoogle(googleProfile);

      // Verify: Created new user
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: googleProfile.email,
        googleId: googleProfile.googleId,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        profileImage: googleProfile.profileImage,
      });
    });
  });

  /**
   * TEST GROUP: Profile Management
   */
  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Setup: User exists
      mockUserRepo.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      // Act: Update profile
      const result = await service.updateProfile(mockUser.id, {
        firstName: 'Updated',
      });

      // Assert: Profile updated
      expect(result.firstName).toBe('Updated');

      // Verify: Called repository correctly
      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('should sanitize profile data', async () => {
      // Setup: User exists
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      // Act: Update with potentially malicious data
      await service.updateProfile(mockUser.id, {
        firstName: '<script>alert("xss")</script>John',
        lastName: '  Doe  ',
      });

      // Verify: Sanitized data (HTML stripped, whitespace trimmed)
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          firstName: 'John', // HTML stripped
          lastName: 'Doe', // Trimmed
        }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Setup: User doesn't exist
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert: Should throw
      await expect(
        service.updateProfile('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * TEST GROUP: Email Availability
   */
  describe('isEmailAvailable', () => {
    it('should return true for available email', async () => {
      // Setup: Email doesn't exist
      mockUserRepo.existsByEmail.mockResolvedValue(false);

      // Act: Check availability
      const result = await service.isEmailAvailable('available@example.com');

      // Assert: Email is available
      expect(result).toBe(true);
    });

    it('should return false for taken email', async () => {
      // Setup: Email exists
      mockUserRepo.existsByEmail.mockResolvedValue(true);

      // Act: Check availability
      const result = await service.isEmailAvailable('taken@example.com');

      // Assert: Email is not available
      expect(result).toBe(false);
    });
  });
});
