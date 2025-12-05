/**
 * CoreModule - Business Logic Layer Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfrastructureModule } from '../infra/infrastructure.module';
import { UserService } from '@core/services/user.service';
import { HealthService } from '@core/services/health.service';
import { GoalService } from '@core/services/goal.service';
import { IntegrationService } from '@core/services/integration.service';
import { WeightLossStrategy } from '@core/strategies/weight-loss.strategy';
import { WeightGainStrategy } from '@core/strategies/weight-gain.strategy';
import { StepsStrategy } from '@core/strategies/steps.strategy';
import { ExerciseStrategy } from '@core/strategies/exercise.strategy';
import { GoalCalculationStrategyFactory } from '@core/strategies/goal-calculation-strategy.factory';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    //Import InfrastructureModule to get access to repositories
    InfrastructureModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    //Domain Services contain business logic and use repositories
    UserService,
    HealthService,
    GoalService,
    IntegrationService,

    // Strategy Pattern Implementations - These are injected into GoalCalculationStrategyFactory
    WeightLossStrategy,
    WeightGainStrategy,
    StepsStrategy,
    ExerciseStrategy,
    GoalCalculationStrategyFactory,
  ],
  exports: [
    //Export services so controllers can use them
    UserService,
    HealthService,
    GoalService,
    IntegrationService,
    JwtModule,
  ],
})
export class CoreModule {}

/**
 * MODULE ARCHITECTURE:
 *
 * 1. AppModule imports CoreModule
 * 2. CoreModule imports InfrastructureModule
 * 3. InfrastructureModule provides UserRepository
 * 4. CoreModule creates UserService with injected IUserRepository
 * 5. CoreModule exports UserService
 * 6. Controllers inject UserService
 */
