import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ExperienceLevelsService } from './experience-levels.service';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { CreateExperienceLevelDto, UpdateExperienceLevelDto, ExperienceLevelResponseDto, ExperienceLevelPageQueryDto, PagedExperienceLevelsResponseDto } from './experience-levels.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Experience Levels')
@Controller('experience-levels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ExperienceLevelsController {
    constructor(private readonly experienceLevelsService: ExperienceLevelsService) { }

    @Get('all')
    @ApiOperation({ 
        summary: 'Get all active experience levels',
        description: 'Retrieve a list of all active experience levels ordered by minimum years and sort order'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of experience levels',
        type: [ExperienceLevelResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAll(): Promise<ExperienceLevel[]> {
        return this.experienceLevelsService.findAll();
    }

    @Public()
    @Get('complete')
    @ApiOperation({ 
        summary: 'Get all active experience levels',
        description: 'Retrieve a list of all active experience levels ordered by minimum years and sort order'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of experience levels',
        type: [ExperienceLevelResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAllComplete(): Promise<ExperienceLevel[]> {
        return this.experienceLevelsService.findAll();
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get experience levels with pagination and search',
        description: 'Retrieve experience levels with pagination support and optional search functionality'
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
        example: 'junior'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'minYearsFilter',
        required: false,
        description: 'Filter by minimum years of experience',
        example: 2
    })
    @ApiQuery({
        name: 'maxYearsFilter',
        required: false,
        description: 'Filter by maximum years of experience',
        example: 10
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of experience levels',
        type: PagedExperienceLevelsResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findWithPagination(@Query() queryOptions: ExperienceLevelPageQueryDto): Promise<PagedExperienceLevelsResponseDto> {
        return this.experienceLevelsService.findWithPagination(queryOptions);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get experience level by ID',
        description: 'Retrieve a specific experience level by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the experience level',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved experience level',
        type: ExperienceLevelResponseDto
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
        description: 'Experience level not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ExperienceLevel> {
        return this.experienceLevelsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Create new experience level',
        description: 'Create a new experience level. Requires admin or super-admin role.'
    })
    @ApiBody({
        type: CreateExperienceLevelDto,
        description: 'Experience level data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created experience level',
        type: ExperienceLevelResponseDto
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
        description: 'Conflict - Experience level with same name already exists' 
    })
    async create(@Body() createExperienceLevelDto: CreateExperienceLevelDto): Promise<ExperienceLevel> {
        return this.experienceLevelsService.create(createExperienceLevelDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update experience level',
        description: 'Update an existing experience level. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the experience level to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateExperienceLevelDto,
        description: 'Experience level update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated experience level',
        type: ExperienceLevelResponseDto
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
        description: 'Experience level not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Experience level with same name already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateExperienceLevelDto: UpdateExperienceLevelDto
    ): Promise<ExperienceLevel> {
        return this.experienceLevelsService.update(id, updateExperienceLevelDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete experience level',
        description: 'Soft delete an experience level by setting isActive to false. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the experience level to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted experience level' 
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
        description: 'Experience level not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.experienceLevelsService.remove(id);
    }
} 