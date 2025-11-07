/**
 * CoreModule - Business Logic Layer Module
 *
 * This module is responsible for:
 * 1. Providing domain services (business logic)
 * 2. Importing repositories from InfrastructureModule
 * 3. Making services available to application layer (controllers)
 */

import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infra/infrastructure.module';
import { UserService } from './core/services/user.service';

@Module({
  imports: [
    //Import InfrastructureModule to get access to repositories
    InfrastructureModule,
  ],
  providers: [
    //Domain Services contain business logic and use repositories
    UserService,

    // Future services:
    // GoalService,
    // HealthService,
    // IntegrationService,
  ],
  exports: [
    //Export services so controllers can use them
    UserService,

    // Future exports:
    // GoalService,
    // HealthService,
  ],
})
export class CoreModule {}

/**
 * MODULE ARCHITECTURE:
 *
 * 1. AppModule imports CoreModule
 * 2. CoreModule imports InfrastructureModule
 * 3. InfrastructureModule provides 'IUserRepository'
 * 4. CoreModule creates UserService with injected 'IUserRepository'
 * 5. CoreModule exports UserService
 * 6. Controllers inject UserService
 */
