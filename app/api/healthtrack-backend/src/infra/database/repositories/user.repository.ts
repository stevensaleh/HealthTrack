/**
 * UserRepository - Prisma Implementation (ADAPTER)
 * This class implements IUserRepository using Prisma ORM.
 * It's the "adapter" that connects our domain (interface) to infrastructure (database).
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import {
  CreateUserData,
  UpdateUserData,
  UserWithRelations,
} from '../../../core/types/user.types';

import { PrismaService } from '../prisma.service';

@Injectable() // NestJS decorator - makes this class injectable
export class UserRepository implements IUserRepository {
  /**
   * Constructor with Dependency Injection
   * PrismaService is injected by NestJS
   * We don't create it - NestJS manages its lifecycle
   */
  constructor(private readonly prisma: PrismaService) {}

  //Find user by ID
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  //Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  //Find user by Google OAuth ID
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  //Check if email exists
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  //Create new user
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        googleId: data.googleId,
        profileImage: data.profileImage,
      },
    });
  }

  //Update existing user
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          profileImage: data.profileImage,
          googleId: data.googleId,
        },
      });
    } catch (error: any) {
      // Prisma error code P2025 = Record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      // Re-throw other errors
      throw error;
    }
  }

  //Delete user
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  //Find user with all relations
  async findByIdWithRelations(id: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        healthData: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        goals: {
          orderBy: { createdAt: 'desc' },
        },
        integrations: {
          where: { isActive: true },
        },
      },
    }) as Promise<UserWithRelations | null>;
  }
}
