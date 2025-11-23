/**
 * Health Controller
 *
 * Handles HTTP requests for health data management.
 *
 * Endpoints:
 * - POST   /health                    - Log daily health data
 * - GET    /health                    - Get health data with filtering
 * - GET    /health/latest             - Get most recent entry
 * - GET    /health/tracking-status    - Get tracking status
 * - GET    /health/:id                - Get specific entry
 * - PATCH  /health/:id                - Update entry
 * - DELETE /health/:id                - Delete entry
 * - GET    /health/stats/weekly       - Weekly summary
 * - GET    /health/stats/monthly      - Monthly summary
 * - GET    /health/stats/custom       - Custom date range stats
 * - GET    /health/trends/:metric     - Metric trend analysis
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { HealthService } from '@core/services/health.service';
import {
  CreateHealthDataDto,
  UpdateHealthDataDto,
  HealthDataResponseDto,
  HealthStatsResponseDto,
  HealthQueryDto,
  CustomStatsQueryDto,
  TrendResponseDto,
  TrackingStatusDto,
} from '../dto/health.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Health Data')
@Controller('health')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  /**
   * Log daily health data
   *
   * Creates a new health data entry for the authenticated user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Log health data',
    description:
      'Create a new health data entry for the current date or specified date',
  })
  @ApiResponse({
    status: 201,
    description: 'Health data logged successfully',
    type: HealthDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Health data already exists for this date',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async logHealthData(
    @Body() dto: CreateHealthDataDto,
    @Request() req: any,
  ): Promise<HealthDataResponseDto> {
    this.logger.log(`User ${req.user.id} logging health data`);

    const result = await this.healthService.logHealthData(req.user.id, {
      date: dto.date ? new Date(dto.date) : undefined,
      weight: dto.weight,
      height: dto.height,
      steps: dto.steps,
      calories: dto.calories,
      sleep: dto.sleep,
      water: dto.water,
      exercise: dto.exercise,
      heartRate: dto.heartRate,
      notes: dto.notes,
      mood: dto.mood,
    });

    return result as any;
  }

  /**
   * Get health data with optional filtering
   */
  @Get()
  @ApiOperation({
    summary: 'Get health data',
    description:
      'Retrieve health data entries with optional filtering by date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Health data retrieved successfully',
    type: [HealthDataResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getHealthData(
    @Query() query: HealthQueryDto,
    @Request() req: any,
  ): Promise<HealthDataResponseDto[]> {
    this.logger.log(`User ${req.user.id} retrieving health data`);

    const queryParams = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.healthService.getHealthData(
      req.user.id,
      queryParams,
    );

    return results as any;
  }

  /**
   * Get latest health data entry
   */
  @Get('latest')
  @ApiOperation({
    summary: 'Get latest health data',
    description: 'Retrieve the most recent health data entry',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest health data retrieved',
    type: HealthDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No health data found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getLatestHealthData(
    @Request() req: any,
  ): Promise<HealthDataResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving latest health data`);

    const result = await this.healthService.getLatestHealthData(req.user.id);

    if (!result) {
      throw new NotFoundException('No health data found');
    }

    return result as any;
  }

  /**
   * Get tracking status
   */
  @Get('tracking-status')
  @ApiOperation({
    summary: 'Get tracking status',
    description: 'Get information about tracking status and streaks',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking status retrieved',
    type: TrackingStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getTrackingStatus(@Request() req: any): Promise<TrackingStatusDto> {
    this.logger.log(`User ${req.user.id} retrieving tracking status`);

    const [loggedToday, totalDaysTracked, latestEntry] = await Promise.all([
      this.healthService.hasLoggedToday(req.user.id),
      this.healthService.getTotalDaysTracked(req.user.id),
      this.healthService.getLatestHealthData(req.user.id),
    ]);

    return {
      loggedToday,
      totalDaysTracked,
      latestEntryDate: latestEntry?.date,
    };
  }

  /**
   * Get weekly summary statistics
   */
  @Get('stats/weekly')
  @ApiOperation({
    summary: 'Get weekly statistics',
    description: 'Get health statistics for the last 7 days',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly statistics retrieved',
    type: HealthStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getWeeklySummary(@Request() req: any): Promise<HealthStatsResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving weekly summary`);

    const result = await this.healthService.getWeeklySummary(req.user.id);

    return result as any;
  }

  /**
   * Get monthly summary statistics
   */
  @Get('stats/monthly')
  @ApiOperation({
    summary: 'Get monthly statistics',
    description: 'Get health statistics for the last 30 days',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly statistics retrieved',
    type: HealthStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMonthlySummary(
    @Request() req: any,
  ): Promise<HealthStatsResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving monthly summary`);

    const result = await this.healthService.getMonthlySummary(req.user.id);

    return result as any;
  }

  /**
   * Get custom date range statistics
   */
  @Get('stats/custom')
  @ApiOperation({
    summary: 'Get custom date range statistics',
    description: 'Get health statistics for a specific date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom statistics retrieved',
    type: HealthStatsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getCustomStatistics(
    @Query() query: CustomStatsQueryDto,
    @Request() req: any,
  ): Promise<HealthStatsResponseDto> {
    this.logger.log(
      `User ${req.user.id} retrieving custom statistics for ${query.startDate} to ${query.endDate}`,
    );

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const result = await this.healthService.getStatistics(
      req.user.id,
      startDate,
      endDate,
    );

    return result as any;
  }

  /**
   * Get trend for specific metric
   */
  @Get('trends/:metric')
  @ApiOperation({
    summary: 'Get metric trend',
    description: 'Get trend analysis for a specific health metric',
  })
  @ApiParam({
    name: 'metric',
    description: 'Health metric to analyze',
    enum: [
      'weight',
      'steps',
      'calories',
      'sleep',
      'water',
      'exercise',
      'heartRate',
    ],
    example: 'weight',
  })
  @ApiResponse({
    status: 200,
    description: 'Trend analysis retrieved',
    type: TrendResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid metric type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMetricTrend(
    @Param('metric') metric: string,
    @Query('days') days?: number,
    @Request() req?: any,
  ): Promise<TrendResponseDto> {
    this.logger.log(
      `User ${req.user.id} retrieving ${metric} trend for ${days || 7} days`,
    );

    const validMetrics = [
      'weight',
      'steps',
      'calories',
      'sleep',
      'water',
      'exercise',
      'heartRate',
    ];

    if (!validMetrics.includes(metric)) {
      throw new BadRequestException(
        `Invalid metric. Must be one of: ${validMetrics.join(', ')}`,
      );
    }

    const daysToAnalyze = days || 7;
    const trend = await this.healthService.getMetricTrend(
      req.user.id,
      metric as any,
      daysToAnalyze,
    );

    let message: string | undefined;
    if (trend) {
      message = `${metric.charAt(0).toUpperCase() + metric.slice(1)} is ${trend} over the last ${daysToAnalyze} days`;
    }

    return {
      metric,
      days: daysToAnalyze,
      trend,
      message,
    };
  }

  /**
   * Get specific health data entry by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get health data by ID',
    description: 'Retrieve a specific health data entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Health data entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Health data retrieved',
    type: HealthDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Health data entry not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getHealthDataById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<HealthDataResponseDto> {
    this.logger.log(`User ${req.user.id} retrieving health data ${id}`);

    const result = await this.healthService.getHealthDataById(req.user.id, id);

    return result as any;
  }

  /**
   * Update health data entry
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update health data',
    description: 'Update an existing health data entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Health data entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Health data updated successfully',
    type: HealthDataResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Health data entry not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateHealthData(
    @Param('id') id: string,
    @Body() dto: UpdateHealthDataDto,
    @Request() req: any,
  ): Promise<HealthDataResponseDto> {
    this.logger.log(`User ${req.user.id} updating health data ${id}`);

    const result = await this.healthService.updateHealthData(
      req.user.id,
      id,
      dto,
    );

    return result as any;
  }

  /**
   * Delete health data entry
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete health data',
    description: 'Delete a health data entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Health data entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Health data deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Health data deleted successfully',
        },
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Health data entry not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteHealthData(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string; id: string }> {
    this.logger.log(`User ${req.user.id} deleting health data ${id}`);

    await this.healthService.deleteHealthData(req.user.id, id);

    return {
      message: 'Health data deleted successfully',
      id,
    };
  }
}
