import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/database/prisma.module';
import { ApplicationModule } from './app/application.module';

@Module({
  imports: [
    // Load environment vars
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available everywhere
    }),

    // DB module
    PrismaModule,

    // App layer module
    ApplicationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
