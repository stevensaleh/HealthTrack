import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '@core/services/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Extract firstName and lastName from name if provided
      let firstName = registerDto.firstName;
      let lastName = registerDto.lastName;

      if (registerDto.name && !firstName && !lastName) {
        const nameParts = registerDto.name.trim().split(/\s+/);
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(' ');
          }
        }
      }

      // Register user using UserService
      const user = await this.userService.register({
        email: registerDto.email,
        password: registerDto.password,
        firstName,
        lastName,
      });

      // Generate JWT tokens
      const tokens = await this.authService.generateTokens(user.id, user.email);

      return {
        success: true,
        user: {
          ...user,
          provider: 'email' as const,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      // Re-throw NestJS HTTP exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      // Login user using UserService
      const user = await this.userService.login({
        email: loginDto.email,
        password: loginDto.password,
      });

      // Generate JWT tokens
      const tokens = await this.authService.generateTokens(user.id, user.email);

      return {
        success: true,
        user: {
          ...user,
          provider: 'email' as const,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      // Re-throw NestJS HTTP exceptions
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Invalid credentials',
      );
    }
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    try {
      // Verify Google token and extract profile
      const googleProfile = await this.authService.verifyGoogleToken(
        googleAuthDto.credential,
      );

      // Login or register user with Google profile
      const user = await this.userService.loginWithGoogle(googleProfile);

      // Generate JWT tokens
      const tokens = await this.authService.generateTokens(user.id, user.email);

      return {
        success: true,
        user: {
          ...user,
          provider: 'google' as const,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      // Re-throw NestJS HTTP exceptions
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Google authentication failed',
      );
    }
  }
}

