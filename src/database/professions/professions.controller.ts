import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProfessionsService } from './professions.service';
import { Profession } from '../entities/profession.entity';
import { CreateProfessionDto, UpdateProfessionDto, ProfessionResponseDto, ProfessionPageQueryDto, PagedProfessionsResponseDto } from './professions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Professions')
@Controller('professions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProfessionsController {
    constructor(private readonly professionsService: ProfessionsService) { }

    @Get('all')
    @ApiOperation({ 
        summary: 'Get all active professions',
        description: 'Retrieve a list of all active professions ordered by sort order and name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of professions',
        type: [ProfessionResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAll(): Promise<Profession[]> {
        return this.professionsService.findAll();
    }

    @Public()
    @Get('complete')
    @ApiOperation({ 
        summary: 'Get all active professions (Public endpoint)',
        description: 'Retrieve a list of all active professions ordered by sort order and name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of professions',
        type: [ProfessionResponseDto]
    })
    async findAllComplete(): Promise<Profession[]> {
        return this.professionsService.findAll();
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get professions with pagination and search',
        description: 'Retrieve professions with pagination support and optional search functionality'
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
        example: 'developer'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of professions',
        type: PagedProfessionsResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findWithPagination(@Query() queryOptions: ProfessionPageQueryDto): Promise<PagedProfessionsResponseDto> {
        const query = {
            ...queryOptions,
            isActive: queryOptions?.isActive ? queryOptions?.isActive : undefined,
        }
        return this.professionsService.findWithPagination(query);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get profession by ID',
        description: 'Retrieve a specific profession by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the profession',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved profession',
        type: ProfessionResponseDto
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
        description: 'Profession not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Profession> {
        return this.professionsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Create new profession',
        description: 'Create a new profession. Requires admin or super-admin role.'
    })
    @ApiBody({
        type: CreateProfessionDto,
        description: 'Profession data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created profession',
        type: ProfessionResponseDto
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
        description: 'Conflict - Profession with same name already exists' 
    })
    async create(@Body() createProfessionDto: CreateProfessionDto): Promise<Profession> {
        return this.professionsService.create(createProfessionDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update profession',
        description: 'Update an existing profession. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the profession to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateProfessionDto,
        description: 'Profession update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated profession',
        type: ProfessionResponseDto
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
        description: 'Profession not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Profession with same name already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateProfessionDto: UpdateProfessionDto
    ): Promise<Profession> {
        return this.professionsService.update(id, updateProfessionDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete profession',
        description: 'Soft delete a profession by setting isActive to false. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the profession to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted profession' 
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
        description: 'Profession not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.professionsService.remove(id);
    }
} 