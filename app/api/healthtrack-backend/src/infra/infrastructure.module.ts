/**
 * InfrastructureModule - Provides Repository Implementations
 *
 * This module is responsible for:
 * 1. Providing concrete implementations of repository interfaces
 * 2. Wiring up dependency injection for repositories
 * 3. Making repositories available to other modules
 *
 * it is the "factory" that creates and provides adapters
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { UserRepository } from './database/repositories/user.repository';

@Module({
  imports: [
    PrismaModule, // Import PrismaModule so we can use PrismaService
  ],
  providers: [
    /**
     * Repository Provider Configuration
     * This tells NestJS:
     * "When someone asks for 'IUserRepository', give them UserRepository"
     */
    {
      provide: 'IUserRepository', // Token (what services ask for)
      useClass: UserRepository, // Implementation (what NestJS provides)
    },
  ],
  exports: [
    /**
     * Export repositories so other modules can use them
     * Other modules can import InfrastructureModule and use repositories
     * CoreModule will import this to get repositories for services
     */
    'IUserRepository',
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
