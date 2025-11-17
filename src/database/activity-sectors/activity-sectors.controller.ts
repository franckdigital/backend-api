import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ActivitySectorsService } from './activity-sectors.service';
import { ActivitySector } from '../entities/activity-sector.entity';
import { CreateActivitySectorDto, UpdateActivitySectorDto, ActivitySectorResponseDto, ActivitySectorPageQueryDto, PagedActivitySectorsResponseDto } from './activity-sectors.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Activity Sectors')
@Controller('activity-sectors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ActivitySectorsController {
  constructor(private readonly activitySectorsService: ActivitySectorsService) {}

  @Get('all')
  @ApiOperation({ 
    summary: 'Get all active activity sectors',
    description: 'Retrieve a list of all active activity sectors ordered by sort order and name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved list of activity sectors',
    type: [ActivitySectorResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  async findAll(): Promise<ActivitySector[]> {
    return this.activitySectorsService.findAll();
  }

  @Public()
  @Get('complete')
  @ApiOperation({ 
    summary: 'Get all active activity sectors',
    description: 'Retrieve a list of all active activity sectors ordered by sort order and name'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved list of activity sectors',
    type: [ActivitySectorResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  async findAllComplete(): Promise<ActivitySector[]> {
    return this.activitySectorsService.findAll();
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get activity sectors with pagination and search',
    description: 'Retrieve activity sectors with pagination support and optional search functionality'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
    example: 1
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: 'Number of items per page',
    example: 10
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for name and description',
    example: 'technology'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    example: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved paginated list of activity sectors',
    type: PagedActivitySectorsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  async findWithPagination(@Query() queryOptions: ActivitySectorPageQueryDto): Promise<PagedActivitySectorsResponseDto> {
    return this.activitySectorsService.findWithPagination(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get activity sector by ID',
    description: 'Retrieve a specific activity sector by its unique identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the activity sector',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved activity sector',
    type: ActivitySectorResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid UUID format' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Activity sector not found' 
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ActivitySector> {
    return this.activitySectorsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ 
    summary: 'Create new activity sector',
    description: 'Create a new activity sector. Requires admin or super-admin role.'
  })
  @ApiBody({
    type: CreateActivitySectorDto,
    description: 'Activity sector data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Successfully created activity sector',
    type: ActivitySectorResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin or super-admin role required' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Activity sector with same name already exists' 
  })
  async create(@Body() createActivitySectorDto: CreateActivitySectorDto): Promise<ActivitySector> {
    return this.activitySectorsService.create(createActivitySectorDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ 
    summary: 'Update activity sector',
    description: 'Update an existing activity sector. Requires admin or super-admin role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the activity sector to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateActivitySectorDto,
    description: 'Activity sector update data'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully updated activity sector',
    type: ActivitySectorResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid UUID format or validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin or super-admin role required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Activity sector not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Activity sector with same name already exists' 
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateActivitySectorDto: UpdateActivitySectorDto
  ): Promise<ActivitySector> {
    return this.activitySectorsService.update(id, updateActivitySectorDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ 
    summary: 'Delete activity sector',
    description: 'Soft delete an activity sector by setting isActive to false. Requires admin or super-admin role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the activity sector to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully deleted activity sector' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid UUID format' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin or super-admin role required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Activity sector not found' 
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.activitySectorsService.remove(id);
  }
} 