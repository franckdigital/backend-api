import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DisabilityTypesService } from './disability-types.service';
import { DisabilityType } from '../entities/disability-type.entity';
import { CreateDisabilityTypeDto, UpdateDisabilityTypeDto, DisabilityTypeResponseDto, DisabilityTypePageQueryDto, PagedDisabilityTypesResponseDto } from './disability-types.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Disability Types')
@Controller('disability-types')
// @UseGuards(PermissionsGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DisabilityTypesController {
    constructor(private readonly disabilityTypesService: DisabilityTypesService) { }

    @Get('all')
    // @RequirePermissions('disability-types:read')
    @ApiOperation({ 
        summary: 'Get all active disability types',
        description: 'Retrieve a list of all active disability types ordered by sort order and name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of disability types',
        type: [DisabilityTypeResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - disability-types:read permission required' 
    })
    async findAll(): Promise<DisabilityType[]> {
        return this.disabilityTypesService.findAll();
    }

    @Public()
    @Get('complete')
    // @RequirePermissions('disability-types:read')
    @ApiOperation({ 
        summary: 'Get all active disability types (Public)',
        description: 'Retrieve a list of all active disability types ordered by sort order and name. This endpoint is publicly accessible without authentication.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of disability types',
        type: [DisabilityTypeResponseDto]
    })
    async findComplete(): Promise<DisabilityType[]> {
        return this.disabilityTypesService.findAll();
    }

    @Get()
    // @RequirePermissions('disability-types:read')
    @ApiOperation({ 
        summary: 'Get disability types with pagination and search',
        description: 'Retrieve disability types with pagination support and optional search functionality'
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
        example: 'visual'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of disability types',
        type: PagedDisabilityTypesResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - disability-types:read permission required' 
    })
    async findWithPagination(@Query() queryOptions: DisabilityTypePageQueryDto): Promise<PagedDisabilityTypesResponseDto> {
        return this.disabilityTypesService.findWithPagination(queryOptions);
    }

    @Get(':id')
    // @RequirePermissions('disability-types:view')
    @ApiOperation({ 
        summary: 'Get disability type by ID',
        description: 'Retrieve a specific disability type by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the disability type',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved disability type',
        type: DisabilityTypeResponseDto
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
        description: 'Forbidden - disability-types:view permission required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Disability type not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DisabilityType> {
        return this.disabilityTypesService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    // @RequirePermissions('disability-types:create')
    @ApiOperation({ 
        summary: 'Create new disability type',
        description: 'Create a new disability type. Requires admin or super-admin role and disability-types:create permission.'
    })
    @ApiBody({
        type: CreateDisabilityTypeDto,
        description: 'Disability type data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created disability type',
        type: DisabilityTypeResponseDto
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
        description: 'Forbidden - Admin/super-admin role and disability-types:create permission required' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Disability type with same name already exists' 
    })
    async create(@Body() createDisabilityTypeDto: CreateDisabilityTypeDto): Promise<DisabilityType> {
        return this.disabilityTypesService.create(createDisabilityTypeDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    // @RequirePermissions('disability-types:update')
    @ApiOperation({ 
        summary: 'Update disability type',
        description: 'Update an existing disability type. Requires admin or super-admin role and disability-types:update permission.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the disability type to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateDisabilityTypeDto,
        description: 'Disability type update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated disability type',
        type: DisabilityTypeResponseDto
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
        description: 'Forbidden - Admin/super-admin role and disability-types:update permission required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Disability type not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Disability type with same name already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateDisabilityTypeDto: UpdateDisabilityTypeDto
    ): Promise<DisabilityType> {
        return this.disabilityTypesService.update(id, updateDisabilityTypeDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    // @RequirePermissions('disability-types:delete')
    @ApiOperation({ 
        summary: 'Delete disability type',
        description: 'Soft delete a disability type by setting isActive to false. Requires admin or super-admin role and disability-types:delete permission.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the disability type to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted disability type' 
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
        description: 'Forbidden - Admin/super-admin role and disability-types:delete permission required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Disability type not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.disabilityTypesService.remove(id);
    }
} 