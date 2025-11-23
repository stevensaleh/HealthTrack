/**
 * User Controller
 *
 * Handles HTTP requests for user management and authentication.
 *
 * Endpoints:
 * - POST   /users/register           - Register new user
 * - POST   /users/login              - Login with email/password
 * - POST   /users/google-login       - Login with Google OAuth
 * - GET    /users/me                 - Get current user profile
 * - PATCH  /users/me                 - Update user profile
 * - POST   /users/change-password    - Change password
 * - DELETE /users/me                 - Delete account
 * - GET    /users/stats              - Get user statistics
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UserService } from '@core/services/user.service';
import { HealthService } from '@core/services/health.service';
import { GoalService } from '@core/services/goal.service';
import {
  RegisterDto,
  LoginDto,
  GoogleLoginDto,
  UserResponseDto,
  AuthResponseDto,
  UpdateProfileDto,
  ChangePasswordDto,
  PasswordChangeResponseDto,
  DeleteAccountResponseDto,
  UserStatsResponseDto,
} from '../dto/user.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly healthService: HealthService,
    private readonly goalService: GoalService,
  ) {}

  /**
   * Register new user with email/password
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register user',
    description: 'Create a new user account with email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or weak password',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.userService.register({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return result as any;
  }

  /**
   * Login with email/password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate user with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const result = await this.userService.login(dto); // Gets AuthResponse with real JWT
    return result as any; 
  }

  /**
   * Login with Google OAuth
   */
  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Google login',
    description: 'Authenticate or register user with Google OAuth',
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Google token',
  })
  async googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponseDto> {
    this.logger.log('Google login attempt');

    // In a real app, you'd verify the Google ID token and extract user info
    // For now, this is a placeholder that shows the structure
    // You'd call: await this.userService.findOrCreateGoogleUser(googleProfile)

    // Mock response for demonstration
    throw new Error(
      'Google OAuth not fully implemented. Please implement Google token verification first.',
    );
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get profile',
    description: 'Get current authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving profile`);

    const user = await this.userService.findById(req.user.id);

    return user as any;
  }

  /**
   * Update user profile
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update current user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    this.logger.log(`User ${req.user.id} updating profile`);

    const user = await this.userService.updateProfile(req.user.id, dto);

    return user as any;
  }

  /**
   * Change password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: PasswordChangeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or incorrect current password',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid new password',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<PasswordChangeResponseDto> {
    this.logger.log(`User ${req.user.id} changing password`);

    await this.userService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Get user statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get comprehensive statistics about user activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: UserStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserStats(@Request() req: any): Promise<UserStatsResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving statistics`);

    // Get user to calculate account age
    const user = await this.userService.findById(req.user.id);
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get health data count
    const healthDataCount = await this.healthService.getTotalDaysTracked(
      req.user.id,
    );

    // Get goal statistics
    const goalStats = await this.goalService.getGoalStatistics(req.user.id);

    // For integrations, we'd need to inject IntegrationService
    // For now, we'll set it to 0
    const integrationsCount = 0;

    // Calculate streak (simplified - you might want more complex logic)
    const hasLoggedToday = await this.healthService.hasLoggedToday(req.user.id);
    const currentStreak = hasLoggedToday ? 1 : 0; // Simplified

    return {
      healthDataCount,
      activeGoalsCount: goalStats.active,
      completedGoalsCount: goalStats.completed,
      integrationsCount,
      accountAgeDays,
      currentStreak,
      longestStreak: currentStreak, // Simplified - would need to calculate from data
    };
  }

  /**
   * Delete user account
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete account',
    description: 'Permanently delete user account and all associated data',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    type: DeleteAccountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteAccount(@Request() req: any): Promise<DeleteAccountResponseDto> {
    this.logger.log(`User ${req.user.id} deleting account`);

    await this.userService.deleteUser(req.user.id);

    return {
      message: 'Account deleted successfully',
      userId: req.user.id,
    };
  }
}
