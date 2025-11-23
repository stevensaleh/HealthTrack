/**
 * Integration Service Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { IntegrationService } from '../integration.service';
import { IIntegrationRepository } from '../../repositories/integration.repository.interface';
import { IHealthDataRepository } from '../../repositories/health-data.repository.interface';
import {
  IHealthDataProviderFactory,
  IHealthDataProvider,
} from '../../providers/health-data-provider.interface';

import {
  HealthDataProvider,
  IntegrationStatus,
  OAuthCredentials,
  ExternalHealthData,
} from '../../types/integration.types';

describe('IntegrationService', () => {
  let service: IntegrationService;
  let integrationRepo: jest.Mocked<IIntegrationRepository>;
  let healthDataRepo: jest.Mocked<IHealthDataRepository>;
  let providerFactory: jest.Mocked<IHealthDataProviderFactory>;
  let mockProvider: jest.Mocked<IHealthDataProvider>;

  // Mock data
  const mockUserId = 'user-123';
  const mockIntegrationId = 'integration-456';

  const mockCredentials: OAuthCredentials = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    scope: 'fitness.read',
  };

  const mockIntegration = {
    id: mockIntegrationId,
    userId: mockUserId,
    provider: HealthDataProvider.STRAVA,
    credentials: mockCredentials,
    status: IntegrationStatus.ACTIVE,
    isActive: true,
    lastSyncedAt: null,
    syncErrorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock repository
    const mockIntegrationRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndProvider: jest.fn(),
      findActiveByUserId: jest.fn(),
      create: jest.fn(),
      updateCredentials: jest.fn(),
      updateStatus: jest.fn(),
      updateLastSynced: jest.fn(),
      recordSyncError: jest.fn(),
      delete: jest.fn(),
    };

    const mockHealthDataRepo = {
      findByUserAndDate: jest.fn(), // ✅ FIXED METHOD NAME
      create: jest.fn(),
    };

    // Create mock provider
    mockProvider = {
      getProviderName: jest.fn().mockReturnValue(HealthDataProvider.STRAVA),
      getAuthorizationUrl: jest.fn(),
      exchangeCodeForToken: jest.fn(),
      fetchHealthData: jest.fn(),
      refreshAccessToken: jest.fn(),
      revokeAccess: jest.fn(),
    };

    // Create mock factory
    const mockProviderFactory = {
      getProvider: jest.fn().mockReturnValue(mockProvider),
      getSupportedProviders: jest.fn(),
      isProviderSupported: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        {
          provide: 'IIntegrationRepository',
          useValue: mockIntegrationRepo,
        },
        {
          provide: 'IHealthDataRepository',
          useValue: mockHealthDataRepo,
        },
        {
          provide: 'IHealthDataProviderFactory',
          useValue: mockProviderFactory,
        },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
    integrationRepo = module.get('IIntegrationRepository');
    healthDataRepo = module.get('IHealthDataRepository');
    providerFactory = module.get('IHealthDataProviderFactory');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateConnection', () => {
    it('should generate authorization URL for new connection', async () => {
      // Arrange
      integrationRepo.findByUserIdAndProvider.mockResolvedValue(null);
      mockProvider.getAuthorizationUrl.mockResolvedValue({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?...',
        state: 'encoded-state',
        expiresAt: new Date(Date.now() + 600000),
      });

      // Act
      const result = await service.initiateConnection(
        mockUserId,
        HealthDataProvider.STRAVA,
      );

      // Assert
      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
      expect(integrationRepo.findByUserIdAndProvider).toHaveBeenCalledWith(
        mockUserId,
        HealthDataProvider.STRAVA,
      );
      expect(mockProvider.getAuthorizationUrl).toHaveBeenCalled();
    });

    it('should throw ConflictException if active integration already exists', async () => {
      // Arrange
      integrationRepo.findByUserIdAndProvider.mockResolvedValue({
        ...mockIntegration,
        status: IntegrationStatus.ACTIVE,
        isActive: true,
      } as any);

      // Act & Assert
      await expect(
        service.initiateConnection(mockUserId, HealthDataProvider.STRAVA),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow reconnection if previous integration was revoked', async () => {
      // Arrange
      integrationRepo.findByUserIdAndProvider.mockResolvedValue({
        ...mockIntegration,
        status: IntegrationStatus.REVOKED,
        isActive: false,
      } as any);
      mockProvider.getAuthorizationUrl.mockResolvedValue({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?...',
        state: 'encoded-state',
        expiresAt: new Date(Date.now() + 600000),
      });

      // Act
      const result = await service.initiateConnection(
        mockUserId,
        HealthDataProvider.STRAVA,
      );

      // Assert
      expect(result).toHaveProperty('authUrl');
    });
  });

  describe('completeConnection', () => {
    const mockAuthCode = 'auth-code-789';
    const mockState = Buffer.from(
      JSON.stringify({
        userId: mockUserId,
        provider: HealthDataProvider.STRAVA,
        redirectUri: 'http://localhost:3000/callback',
        timestamp: Date.now(),
        nonce: 'random-nonce',
      }),
    ).toString('base64');

    it('should create new integration after successful OAuth', async () => {
      // Arrange
      integrationRepo.findByUserIdAndProvider.mockResolvedValue(null);
      mockProvider.exchangeCodeForToken.mockResolvedValue(mockCredentials);
      integrationRepo.create.mockResolvedValue({
        ...mockIntegration,
        status: IntegrationStatus.ACTIVE, // ✅ FIXED - was EXPIRED
        isActive: true,
      } as any);

      // Act
      const result = await service.completeConnection(mockAuthCode, mockState);

      // Assert
      expect(result).toEqual({
        id: mockIntegrationId,
        provider: HealthDataProvider.STRAVA,
        status: IntegrationStatus.ACTIVE,
      });
      expect(mockProvider.exchangeCodeForToken).toHaveBeenCalledWith(
        mockAuthCode,
      );
      expect(integrationRepo.create).toHaveBeenCalledWith({
        userId: mockUserId,
        provider: HealthDataProvider.STRAVA,
        credentials: mockCredentials,
        status: IntegrationStatus.ACTIVE,
      });
    });

    it('should update existing integration if already exists', async () => {
      // Arrange
      integrationRepo.findByUserIdAndProvider.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.exchangeCodeForToken.mockResolvedValue(mockCredentials);
      integrationRepo.updateCredentials.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      integrationRepo.updateStatus.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const result = await service.completeConnection(mockAuthCode, mockState);

      // Assert
      expect(integrationRepo.updateCredentials).toHaveBeenCalledWith(
        mockIntegrationId,
        mockCredentials,
      );
      expect(integrationRepo.updateStatus).toHaveBeenCalledWith(
        mockIntegrationId,
        IntegrationStatus.ACTIVE,
      );
    });

    it('should throw BadRequestException for invalid state', async () => {
      // Arrange
      const invalidState = 'invalid-base64-state';

      // Act & Assert
      await expect(
        service.completeConnection(mockAuthCode, invalidState),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired state', async () => {
      // Arrange - state from 15 minutes ago (expired after 10 minutes)
      const expiredState = Buffer.from(
        JSON.stringify({
          userId: mockUserId,
          provider: HealthDataProvider.STRAVA,
          redirectUri: 'http://localhost:3000/callback',
          timestamp: Date.now() - 15 * 60 * 1000,
          nonce: 'random-nonce',
        }),
      ).toString('base64');

      // Act & Assert
      await expect(
        service.completeConnection(mockAuthCode, expiredState),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('syncHealthData', () => {
    const mockExternalData: ExternalHealthData[] = [
      {
        date: new Date('2024-01-01'),
        steps: 8500,
        weight: 75.5,
        caloriesBurned: 2200,
        exerciseMinutes: 45,
        provider: HealthDataProvider.STRAVA,
      },
      {
        date: new Date('2024-01-02'),
        steps: 10200,
        weight: 75.3,
        caloriesBurned: 2400,
        exerciseMinutes: 60,
        provider: HealthDataProvider.STRAVA,
      },
    ];

    it('should sync health data successfully', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.fetchHealthData.mockResolvedValue(mockExternalData);
      healthDataRepo.findByUserAndDate.mockResolvedValue(null); // ✅ FIXED METHOD NAME
      healthDataRepo.create.mockResolvedValue({} as any);
      integrationRepo.updateLastSynced.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const result = await service.syncHealthData(mockIntegrationId);

      // Assert
      expect(result.recordsSynced).toBe(2);
      expect(result.recordsSkipped).toBe(0);
      expect(result.errors).toBe(0);
      expect(healthDataRepo.create).toHaveBeenCalledTimes(2);
      expect(integrationRepo.updateLastSynced).toHaveBeenCalledWith(
        mockIntegrationId,
      );
    });

    it('should skip existing records when not force syncing', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.fetchHealthData.mockResolvedValue(mockExternalData);
      healthDataRepo.findByUserAndDate.mockResolvedValue({} as any); // Record exists - ✅ FIXED METHOD NAME
      integrationRepo.updateLastSynced.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const result = await service.syncHealthData(mockIntegrationId);

      // Assert
      expect(result.recordsSynced).toBe(0);
      expect(result.recordsSkipped).toBe(2);
      expect(healthDataRepo.create).not.toHaveBeenCalled();
    });

    it('should refresh expired token before syncing', async () => {
      // Arrange - integration with expired token
      const expiredCredentials = {
        ...mockCredentials,
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      };
      const integrationWithExpiredToken = {
        ...mockIntegration,
        credentials: expiredCredentials,
        isActive: true,
      };

      integrationRepo.findById.mockResolvedValue(
        integrationWithExpiredToken as any,
      );
      mockProvider.refreshAccessToken.mockResolvedValue(mockCredentials);
      integrationRepo.updateCredentials.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.fetchHealthData.mockResolvedValue(mockExternalData);
      healthDataRepo.findByUserAndDate.mockResolvedValue(null); // ✅ FIXED METHOD NAME
      healthDataRepo.create.mockResolvedValue({} as any);
      integrationRepo.updateLastSynced.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const result = await service.syncHealthData(mockIntegrationId);

      // Assert
      expect(mockProvider.refreshAccessToken).toHaveBeenCalledWith(
        expiredCredentials.refreshToken,
      );
      expect(integrationRepo.updateCredentials).toHaveBeenCalledWith(
        mockIntegrationId,
        mockCredentials,
      );
      expect(result.recordsSynced).toBe(2);
    });

    it('should throw NotFoundException if integration not found', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.syncHealthData(mockIntegrationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if integration is revoked', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        status: IntegrationStatus.REVOKED,
        isActive: false, // ✅ SET TO FALSE for revoked integration
      } as any);

      // Act & Assert
      await expect(service.syncHealthData(mockIntegrationId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle API errors and record error status', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.fetchHealthData.mockRejectedValue(
        new Error('API rate limit exceeded'),
      );
      integrationRepo.recordSyncError.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act & Assert
      await expect(service.syncHealthData(mockIntegrationId)).rejects.toThrow(
        'API rate limit exceeded',
      );
      expect(integrationRepo.recordSyncError).toHaveBeenCalledWith(
        mockIntegrationId,
        'API rate limit exceeded',
      );
    });
  });

  describe('getUserIntegrations', () => {
    it('should return integrations without sensitive credentials', async () => {
      // Arrange
      integrationRepo.findByUserId.mockResolvedValue([
        { ...mockIntegration, isActive: true } as any,
        { ...mockIntegration, id: 'integration-789', isActive: true } as any,
      ]);

      // Act
      const result = await service.getUserIntegrations(mockUserId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('credentials');
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('provider');
      expect(result[0]).toHaveProperty('status');
    });
  });

  describe('disconnectIntegration', () => {
    it('should revoke access and delete integration', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.revokeAccess.mockResolvedValue();
      integrationRepo.delete.mockResolvedValue();

      // Act
      await service.disconnectIntegration(mockIntegrationId, mockUserId);

      // Assert
      expect(mockProvider.revokeAccess).toHaveBeenCalledWith(mockCredentials);
      expect(integrationRepo.delete).toHaveBeenCalledWith(mockIntegrationId);
    });

    it('should throw NotFoundException if integration not found', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.disconnectIntegration(mockIntegrationId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user does not own integration', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        userId: 'different-user-id',
        isActive: true,
      } as any);

      // Act & Assert
      await expect(
        service.disconnectIntegration(mockIntegrationId, mockUserId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should delete integration even if provider revocation fails', async () => {
      // Arrange
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.revokeAccess.mockRejectedValue(
        new Error('Provider API unavailable'),
      );
      integrationRepo.delete.mockResolvedValue();

      // Act
      await service.disconnectIntegration(mockIntegrationId, mockUserId);

      // Assert - should still delete locally despite provider error
      expect(integrationRepo.delete).toHaveBeenCalledWith(mockIntegrationId);
    });
  });

  describe('syncAllIntegrations', () => {
    it('should sync multiple integrations', async () => {
      // Arrange
      const integrations = [
        { ...mockIntegration, isActive: true },
        {
          ...mockIntegration,
          id: 'integration-789',
          provider: HealthDataProvider.FITBIT,
          isActive: true,
        },
      ];
      integrationRepo.findActiveByUserId.mockResolvedValue(integrations as any);
      integrationRepo.findById.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);
      mockProvider.fetchHealthData.mockResolvedValue([]);
      integrationRepo.updateLastSynced.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const results = await service.syncAllIntegrations(mockUserId);

      // Assert
      expect(results).toHaveLength(2);
      expect(integrationRepo.findById).toHaveBeenCalledTimes(2);
    });

    it('should continue syncing other integrations if one fails', async () => {
      // Arrange
      const integrations = [
        { ...mockIntegration, isActive: true },
        { ...mockIntegration, id: 'integration-789', isActive: true },
      ];
      integrationRepo.findActiveByUserId.mockResolvedValue(integrations as any);

      // First call fails, second succeeds
      integrationRepo.findById
        .mockResolvedValueOnce(null) // First integration not found (error)
        .mockResolvedValueOnce({
          ...mockIntegration,
          isActive: true,
        } as any); // Second integration found

      mockProvider.fetchHealthData.mockResolvedValue([]);
      integrationRepo.updateLastSynced.mockResolvedValue({
        ...mockIntegration,
        isActive: true,
      } as any);

      // Act
      const results = await service.syncAllIntegrations(mockUserId);

      // Assert - should have 1 result (second integration)
      expect(results).toHaveLength(1);
    });
  });
});
