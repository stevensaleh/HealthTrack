/**
 * Goal Controller
 *
 * Handles HTTP requests for goal management.
 *
 * Endpoints:
 * - POST   /goals                - Create new goal
 * - GET    /goals                - Get all goals with progress
 * - GET    /goals/active         - Get active goals
 * - GET    /goals/stats          - Get goal statistics
 * - GET    /goals/:id            - Get specific goal with progress
 * - PATCH  /goals/:id            - Update goal
 * - POST   /goals/:id/complete   - Mark goal as completed
 * - POST   /goals/:id/cancel     - Cancel goal
 * - POST   /goals/:id/pause      - Pause goal
 * - POST   /goals/:id/resume     - Resume goal
 * - DELETE /goals/:id            - Delete goal
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';

import { GoalService } from '@core/services/goal.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalResponseDto,
  GoalWithProgressResponseDto,
  GoalStatsResponseDto,
  GoalStatusChangeResponseDto,
  GoalDeleteResponseDto,
  GoalListResponseDto,
} from '../dto/goal.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalController {
  private readonly logger = new Logger(GoalController.name);

  constructor(private readonly goalService: GoalService) {}

  /**
   * Create a new goal
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create goal',
    description: 'Create a new health or fitness goal',
  })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Active goal of this type already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createGoal(
    @Body() dto: CreateGoalDto,
    @Request() req: any,
  ): Promise<GoalResponseDto> {
    this.logger.log(
      `User ${req.user.id} creating ${dto.type} goal: ${dto.title}`,
    );

    const result = await this.goalService.createGoal(req.user.id, {
      type: dto.type,
      title: dto.title,
      description: dto.description,
      targetValue: dto.targetValue,
      startValue: dto.startValue,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: new Date(dto.endDate),
    });

    return result as any;
  }

  /**
   * Get all goals with progress
   */
  @Get()
  @ApiOperation({
    summary: 'Get all goals',
    description: 'Retrieve all goals with current progress information',
  })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
    type: GoalListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getAllGoals(@Request() req: any): Promise<GoalListResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving all goals`);

    const goals = await this.goalService.getAllGoalsWithProgress(req.user.id);

    return {
      goals: goals as any,
      total: goals.length,
    };
  }

  /**
   * Get active goals with progress
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get active goals',
    description: 'Retrieve only active goals with current progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Active goals retrieved successfully',
    type: GoalListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getActiveGoals(@Request() req: any): Promise<GoalListResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving active goals`);

    const goals = await this.goalService.getActiveGoalsWithProgress(
      req.user.id,
    );

    return {
      goals: goals as any,
      total: goals.length,
    };
  }

  /**
   * Get goal statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get goal statistics',
    description: 'Get summary statistics about user goals',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: GoalStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getGoalStatistics(@Request() req: any): Promise<GoalStatsResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving goal statistics`);

    const stats = await this.goalService.getGoalStatistics(req.user.id);

    return stats as any;
  }

  /**
   * Get specific goal with progress
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get goal by ID',
    description: 'Retrieve a specific goal with current progress',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal retrieved successfully',
    type: GoalWithProgressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getGoalById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalWithProgressResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving goal ${id}`);

    const result = await this.goalService.getGoalWithProgress(req.user.id, id);

    return result as any;
  }

  /**
   * Update goal
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update goal',
    description: 'Update goal details (title, description, target, end date)',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateGoal(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
    @Request() req: any,
  ): Promise<GoalResponseDto> {
    this.logger.log(`User ${req.user.id} updating goal ${id}`);

    const result = await this.goalService.updateGoal(req.user.id, id, {
      title: dto.title,
      description: dto.description,
      targetValue: dto.targetValue,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    return result as any;
  }

  /**
   * Mark goal as completed
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete goal',
    description: 'Mark a goal as completed',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal marked as completed',
    type: GoalStatusChangeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Goal cannot be completed (invalid status)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeGoal(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalStatusChangeResponseDto> {
    this.logger.log(`User ${req.user.id} completing goal ${id}`);

    const result = await this.goalService.completeGoal(req.user.id, id);

    return {
      message: 'Goal marked as completed',
      goal: result as any,
    };
  }

  /**
   * Cancel goal
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel goal',
    description: 'Mark a goal as cancelled',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal cancelled',
    type: GoalStatusChangeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Goal cannot be cancelled (invalid status)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async cancelGoal(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalStatusChangeResponseDto> {
    this.logger.log(`User ${req.user.id} cancelling goal ${id}`);

    const result = await this.goalService.cancelGoal(req.user.id, id);

    return {
      message: 'Goal cancelled',
      goal: result as any,
    };
  }

  /**
   * Pause goal
   */
  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pause goal',
    description: 'Temporarily pause an active goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal paused',
    type: GoalStatusChangeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Only active goals can be paused',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async pauseGoal(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalStatusChangeResponseDto> {
    this.logger.log(`User ${req.user.id} pausing goal ${id}`);

    const result = await this.goalService.pauseGoal(req.user.id, id);

    return {
      message: 'Goal paused',
      goal: result as any,
    };
  }

  /**
   * Resume paused goal
   */
  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resume goal',
    description: 'Resume a paused goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal resumed',
    type: GoalStatusChangeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Only paused goals can be resumed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async resumeGoal(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalStatusChangeResponseDto> {
    this.logger.log(`User ${req.user.id} resuming goal ${id}`);

    const result = await this.goalService.resumeGoal(req.user.id, id);

    return {
      message: 'Goal resumed',
      goal: result as any,
    };
  }

  /**
   * Delete goal
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete goal',
    description: 'Permanently delete a goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal deleted successfully',
    type: GoalDeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Goal not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteGoal(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GoalDeleteResponseDto> {
    this.logger.log(`User ${req.user.id} deleting goal ${id}`);

    await this.goalService.deleteGoal(req.user.id, id);

    return {
      message: 'Goal deleted successfully',
      goalId: id,
    };
  }
}
