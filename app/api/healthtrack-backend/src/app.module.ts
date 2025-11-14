import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/database/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available everywhere
    }),

    // Database module
    PrismaModule,

    // Authentication module
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
