import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { EducationLevelsService } from './education-levels.service';
import { EducationLevel } from '../entities/education-level.entity';
import { CreateEducationLevelDto, UpdateEducationLevelDto, EducationLevelResponseDto, EducationLevelPageQueryDto, PagedEducationLevelsResponseDto } from './education-levels.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Education Levels')
@Controller('education-levels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EducationLevelsController {
    constructor(private readonly educationLevelsService: EducationLevelsService) { }

    @Get('all')
    @ApiOperation({ 
        summary: 'Get all active education levels',
        description: 'Retrieve a list of all active education levels ordered by sort order'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of education levels',
        type: [EducationLevelResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAll(): Promise<EducationLevel[]> {
        return this.educationLevelsService.findAll();
    }

    @Public()
    @Get('complete')
    @ApiOperation({ 
        summary: 'Get all active education levels',
        description: 'Retrieve a list of all active education levels ordered by sort order'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of education levels',
        type: [EducationLevelResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAllComplete(): Promise<EducationLevel[]> {
        return this.educationLevelsService.findAll();
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get education levels with pagination and search',
        description: 'Retrieve education levels with pagination support and optional search functionality'
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
        example: 'bachelor'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of education levels',
        type: PagedEducationLevelsResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findWithPagination(@Query() queryOptions: EducationLevelPageQueryDto): Promise<PagedEducationLevelsResponseDto> {
        return this.educationLevelsService.findWithPagination(queryOptions);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get education level by ID',
        description: 'Retrieve a specific education level by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the education level',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved education level',
        type: EducationLevelResponseDto
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
        description: 'Education level not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EducationLevel> {
        return this.educationLevelsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Create new education level',
        description: 'Create a new education level. Requires admin or super-admin role.'
    })
    @ApiBody({
        type: CreateEducationLevelDto,
        description: 'Education level data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created education level',
        type: EducationLevelResponseDto
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
        description: 'Conflict - Education level with same name already exists' 
    })
    async create(@Body() createEducationLevelDto: CreateEducationLevelDto): Promise<EducationLevel> {
        return this.educationLevelsService.create(createEducationLevelDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update education level',
        description: 'Update an existing education level. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the education level to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateEducationLevelDto,
        description: 'Education level update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated education level',
        type: EducationLevelResponseDto
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
        description: 'Education level not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Education level with same name already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateEducationLevelDto: UpdateEducationLevelDto
    ): Promise<EducationLevel> {
        return this.educationLevelsService.update(id, updateEducationLevelDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete education level',
        description: 'Soft delete an education level by setting isActive to false. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the education level to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted education level' 
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
        description: 'Education level not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.educationLevelsService.remove(id);
    }
} 