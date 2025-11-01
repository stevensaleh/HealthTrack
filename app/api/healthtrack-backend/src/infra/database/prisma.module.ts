import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Global Database Module
 *
 * Making this module @Global() means PrismaService is available
 * everywhere in the application without needing to import PrismaModule
 * in every module that needs database access.
 *
 * This follows the Hexagonal Architecture principle of having
 * infrastructure concerns (database) separated from business logic.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export so other modules can use it
})
export class PrismaModule {}
