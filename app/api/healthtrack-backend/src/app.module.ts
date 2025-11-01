import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/database/prisma.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available everywhere
    }),

    // Database module
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
