import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Database Connection Adapter
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Enable logging for development
    });
  }

  //Connect to database when the module initializes
  async onModuleInit() {
    await this.$connect();
    console.log(' Database connected successfully');
  }

  //Disconnect from database when the module is destroyed
  async onModuleDestroy() {
    await this.$disconnect();
    console.log(' Database disconnected');
  }

  //Helper method to clear all data
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    // Delete in correct order to respect foreign key constraints
    await this.integration.deleteMany();
    await this.goal.deleteMany();
    await this.healthData.deleteMany();
    await this.user.deleteMany();
    console.log(' Database cleaned');
  }
}
