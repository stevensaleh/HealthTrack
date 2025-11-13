/**
 * CoreModule - Business Logic Layer Module
 *
 * This module is responsible for:
 * - Providing domain services business logic
 * - Importing repositories from InfrastructureModule
 * - Making services available to application layer (controllers)
 */

import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infra/infrastructure.module';
import { UserService } from '@core/services/user.service';
import { HealthService } from '@core/services/health.service';
import { GoalService } from '@core/services/goal.service';
import { StepsStrategy } from '@core/strategies/steps.strategy';
import { ExerciseStrategy } from '@core/strategies/exercise.strategy';
import { GoalCalculationStrategyFactory } from '@core/strategies/goal-calculation-strategy.factory';

@Module({
  imports: [
    //Import InfrastructureModule to get access to repositories
    InfrastructureModule,
  ],
  providers: [
    //Domain Services contain business logic and use repositories
    UserService,
    HealthService,
    GoalService,

    // Strategy Pattern Implementations - These are injected into GoalCalculationStrategyFactory
    StepsStrategy,
    ExerciseStrategy,
    GoalCalculationStrategyFactory,
  ],
  exports: [
    //Export services so controllers can use them
    UserService,
    HealthService,
    GoalService,
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
