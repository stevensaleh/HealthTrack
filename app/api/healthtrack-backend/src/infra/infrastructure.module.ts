/**
 * InfrastructureModule - Provides Repository Implementations
 *
 * This module is responsible for:
 * Providing concrete implementations of repository interfaces
 * Wiring up dependency injection for repositories
 * Making repositories available to other modules
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { UserRepository } from './database/repositories/user.repository';
import { HealthDataRepository } from './database/repositories/health-data.repository';
import { GoalRepository } from './database/repositories/goal.repository';
import { IntegrationRepository } from './database/repositories/integration.repository';
// Health provider adapters
import { StravaAdapter } from './adapters/health-providers/strava.adapter';
import { LoseItAdapter } from './adapters/health-providers/lose-it.adapter';
import { FitbitAdapter } from './adapters/health-providers/fitbit.adapter';

// Factory
import { HealthDataProviderFactory } from './factories/health-data-provider.factory';

@Module({
  imports: [
    PrismaModule, // Import PrismaModule so we can use PrismaService
  ],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IHealthDataRepository',
      useClass: HealthDataRepository,
    },
    {
      provide: 'IGoalRepository',
      useClass: GoalRepository,
    },
    {
      provide: 'IIntegrationRepository',
      useClass: IntegrationRepository,
    },
    // Health povider adapters
    StravaAdapter,
    LoseItAdapter,
    FitbitAdapter,

    // Factory
    {
      provide: 'IHealthDataProviderFactory',
      useClass: HealthDataProviderFactory,
    },
    HealthDataProviderFactory,
  ],
  exports: [
    'IUserRepository',
    'IHealthDataRepository',
    'IGoalRepository',
    'IIntegrationRepository',
    'IHealthDataProviderFactory',
    HealthDataProviderFactory,
  ],
})
export class InfrastructureModule {}

/**
 * MODULE ARCHITECTURE:
 *
 * 1. PrismaModule provides PrismaService
 * 2. InfrastructureModule creates UserRepository (needs PrismaService)
 * 3. InfrastructureModule exposes 'IUserRepository' token
 * 4. CoreModule imports InfrastructureModule
 * 5. UserService injects 'IUserRepository' and gets UserRepository
 */
