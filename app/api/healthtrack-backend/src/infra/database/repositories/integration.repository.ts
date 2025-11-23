/**
 * Integration Repository (Prisma Implementation)
 *
 * Implements IIntegrationRepository using Prisma ORM.
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Integration, Prisma } from '@prisma/client';

import { PrismaService } from '@infrastructure/database/prisma.service';
import { IIntegrationRepository } from '@core/repositories/integration.repository.interface';
import {
  CreateIntegrationData,
  UpdateIntegrationData,
  IntegrationStatus,
  HealthDataProvider,
  OAuthCredentials,
} from '@core/types/integration.types';

@Injectable()
export class IntegrationRepository implements IIntegrationRepository {
  private readonly logger = new Logger(IntegrationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Integration | null> {
    try {
      return await this.prisma.integration.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error finding integration by id: ${error.message}`);
      throw new InternalServerErrorException('Failed to find integration');
    }
  }

  async findByUserId(userId: string): Promise<Integration[]> {
    try {
      return await this.prisma.integration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(
        `Error finding integrations by userId: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to find integrations');
    }
  }

  async findByUserIdAndProvider(
    userId: string,
    provider: HealthDataProvider,
  ): Promise<Integration | null> {
    try {
      return await this.prisma.integration.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: provider as any,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Error finding integration by user and provider: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to find integration');
    }
  }

  async findActiveByUserId(userId: string): Promise<Integration[]> {
    try {
      return await this.prisma.integration.findMany({
        where: {
          userId,
          status: IntegrationStatus.ACTIVE as any,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error finding active integrations: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to find active integrations',
      );
    }
  }

  async findIntegrationsNeedingRefresh(
    thresholdMinutes: number,
  ): Promise<Integration[]> {
    try {
      // Calculate threshold timestamp
      const thresholdDate = new Date(Date.now() + thresholdMinutes * 60 * 1000);

      // Find integrations where token expires soon
      const integrations = await this.prisma.integration.findMany({
        where: {
          status: IntegrationStatus.ACTIVE as any,
        },
      });

      // Filter based on credentials expiry (stored in JSON)
      return integrations.filter((integration) => {
        const credentials = integration.credentials;
        if (credentials && credentials.expiresAt) {
          const expiresAt = new Date(credentials.expiresAt);
          return expiresAt <= thresholdDate;
        }
        return false;
      });
    } catch (error) {
      this.logger.error(
        `Error finding integrations needing refresh: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to find integrations needing refresh',
      );
    }
  }

  async create(data: CreateIntegrationData): Promise<Integration> {
    try {
      // Check if integration already exists
      const existing = await this.findByUserIdAndProvider(
        data.userId,
        data.provider,
      );

      if (existing) {
        throw new ConflictException(
          `Integration with ${data.provider} already exists for this user`,
        );
      }

      return await this.prisma.integration.create({
        data: {
          userId: data.userId,
          provider: data.provider as any,
          credentials: data.credentials as any,
          status: (data.status || IntegrationStatus.ACTIVE) as any,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating integration: ${error.message}`);
      throw new InternalServerErrorException('Failed to create integration');
    }
  }

  async update(id: string, data: UpdateIntegrationData): Promise<Integration> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      return await this.prisma.integration.update({
        where: { id },
        data: {
          credentials: data.credentials as any,
          status: data.status as any,
          lastSyncedAt: data.lastSyncedAt,
          syncErrorMessage: data.syncErrorMessage,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating integration: ${error.message}`);
      throw new InternalServerErrorException('Failed to update integration');
    }
  }

  async updateCredentials(
    id: string,
    credentials: OAuthCredentials,
  ): Promise<Integration> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      return await this.prisma.integration.update({
        where: { id },
        data: {
          credentials: credentials as any,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating credentials: ${error.message}`);
      throw new InternalServerErrorException('Failed to update credentials');
    }
  }

  async updateStatus(
    id: string,
    status: IntegrationStatus,
  ): Promise<Integration> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      return await this.prisma.integration.update({
        where: { id },
        data: { status: status as any },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating status: ${error.message}`);
      throw new InternalServerErrorException('Failed to update status');
    }
  }

  async updateLastSynced(
    id: string,
    timestamp: Date = new Date(),
  ): Promise<Integration> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      return await this.prisma.integration.update({
        where: { id },
        data: {
          lastSyncedAt: timestamp,
          syncErrorMessage: null, // Clear any previous errors
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating last synced: ${error.message}`);
      throw new InternalServerErrorException('Failed to update last synced');
    }
  }

  async recordSyncError(
    id: string,
    errorMessage: string,
  ): Promise<Integration> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      return await this.prisma.integration.update({
        where: { id },
        data: {
          status: IntegrationStatus.ERROR as any,
          syncErrorMessage: errorMessage,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error recording sync error: ${error.message}`);
      throw new InternalServerErrorException('Failed to record sync error');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const integration = await this.findById(id);
      if (!integration) {
        throw new NotFoundException(`Integration with id ${id} not found`);
      }

      await this.prisma.integration.delete({
        where: { id },
      });

      this.logger.log(`Integration ${id} deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting integration: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete integration');
    }
  }

  async hasActiveIntegration(
    userId: string,
    provider: HealthDataProvider,
  ): Promise<boolean> {
    try {
      const integration = await this.prisma.integration.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: provider as any,
          },
        },
      });

      return (
        integration !== null &&
        integration.status === (IntegrationStatus.ACTIVE as any)
      );
    } catch (error) {
      this.logger.error(`Error checking active integration: ${error.message}`);
      return false;
    }
  }

  async getIntegrationCountByProvider(): Promise<
    Record<HealthDataProvider, number>
  > {
    try {
      const counts = await this.prisma.integration.groupBy({
        by: ['provider'],
        _count: {
          id: true,
        },
      });

      // Initialize with zeros
      const result: Record<HealthDataProvider, number> = {
        [HealthDataProvider.STRAVA]: 0,
        [HealthDataProvider.LOSE_IT]: 0,
        [HealthDataProvider.FITBIT]: 0,
      };

      // Fill in actual counts
      counts.forEach((count) => {
        result[count.provider as HealthDataProvider] = count._count.id;
      });

      return result;
    } catch (error) {
      this.logger.error(`Error getting integration counts: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to get integration counts',
      );
    }
  }

  async findForBatchSync(
    lastSyncedBefore: Date,
    limit: number,
  ): Promise<Integration[]> {
    try {
      return await this.prisma.integration.findMany({
        where: {
          status: IntegrationStatus.ACTIVE as any,
          OR: [
            { lastSyncedAt: null }, // Never synced
            { lastSyncedAt: { lt: lastSyncedBefore } }, // Synced before threshold
          ],
        },
        orderBy: {
          lastSyncedAt: 'asc', // Oldest first (or null first)
        },
        take: limit,
      });
    } catch (error) {
      this.logger.error(
        `Error finding batch sync integrations: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to find integrations for batch sync',
      );
    }
  }
}
