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
  ],
  exports: ['IUserRepository', 'IHealthDataRepository', 'IGoalRepository'],
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
