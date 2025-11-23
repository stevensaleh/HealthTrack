/**
 * Application Module
 *
 * This module represents the Application Layer (HTTP/API interface).
 *
 * Responsibilities:
 * - Register HTTP controllers
 * - Configure guards (authentication, authorization)
 * - Import CoreModule to access services
 * - Import InfrastructureModule for factories
 */

import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { InfrastructureModule } from '@infra/infrastructure.module';

import { IntegrationController } from './controllers/integration.controller';
import { HealthController } from './controllers/health.controller';
import { GoalController } from './controllers/goal.controller';
import { UserController } from './controllers/user.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [CoreModule, InfrastructureModule],
  controllers: [
    IntegrationController, // HTTP endpoints
    HealthController,
    GoalController,
    UserController,
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class ApplicationModule {}
