import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CompanySizesService } from './company-sizes.service';
import { 
    CreateCompanySizeDto, 
    UpdateCompanySizeDto, 
    CompanySizeQueryDto, 
    CompanySizeResponseDto,
    PaginatedCompanySizeQueryDto,
    PaginatedCompanySizeResponseDto
} from './company-sizes.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Company Sizes')
@Controller('company-sizes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompanySizesController {
    constructor(private readonly companySizesService: CompanySizesService) { }

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ 
        summary: 'Get company sizes with pagination and search',
        description: 'Retrieve a paginated list of active company sizes with optional search functionality' 
    })
    @ApiQuery({
        name: 'page',
        type: Number,
        description: 'Page number (1-based)',
        example: 1,
        required: false
    })
    @ApiQuery({
        name: 'size',
        type: Number,
        description: 'Number of items per page (max 100)',
        example: 10,
        required: false
    })
    @ApiQuery({
        name: 'search',
        type: String,
        description: 'Search term to filter by name or description',
        example: 'enterprise',
        required: false
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Paginated list of company sizes retrieved successfully', 
        type: PaginatedCompanySizeResponseDto,
        example: {
            data: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Small Enterprise',
                    description: 'Companies with 10 to 49 employees',
                    minEmployees: 10,
                    maxEmployees: 49,
                    requiresDisabilityQuota: false,
                    disabilityQuotaPercentage: null,
                    isActive: true,
                    sortOrder: 1,
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-15T10:30:00Z'
                }
            ],
            meta: {
                currentPage: 1,
                totalPages: 3,
                pageSize: 10,
                totalItems: 25,
                hasNext: true,
                hasPrevious: false
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async findAllPaginated(@Query() query: PaginatedCompanySizeQueryDto): Promise<PaginatedCompanySizeResponseDto> {
        return this.companySizesService.findAllPaginated(query);
    }
    @Get('all')
    @ApiOperation({ 
        summary: 'Get all active company sizes',
        description: 'Retrieve a list of all active company sizes ordered by minimum employees and sort order' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of company sizes retrieved successfully', 
        type: [CompanySizeResponseDto],
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Small Enterprise',
                description: 'Companies with 10 to 49 employees',
                minEmployees: 10,
                maxEmployees: 49,
                requiresDisabilityQuota: false,
                disabilityQuotaPercentage: null,
                isActive: true,
                sortOrder: 1,
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            }
        ]
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async findAll(): Promise<CompanySizeResponseDto[]> {
        return this.companySizesService.findAll();
    }

    @Public()
    @Get('complete')
    @ApiOperation({ 
        summary: 'Get all active company sizes',
        description: 'Retrieve a list of all active company sizes ordered by minimum employees and sort order' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of company sizes retrieved successfully', 
        type: [CompanySizeResponseDto],
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Small Enterprise',
                description: 'Companies with 10 to 49 employees',
                minEmployees: 10,
                maxEmployees: 49,
                requiresDisabilityQuota: false,
                disabilityQuotaPercentage: null,
                isActive: true,
                sortOrder: 1,
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            }
        ]
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async findAllComplete(): Promise<CompanySizeResponseDto[]> {
        return this.companySizesService.findAll();
    }

    @Get('by-employee-count')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ 
        summary: 'Get company size by employee count',
        description: 'Find the appropriate company size category based on the number of employees' 
    })
    @ApiQuery({ 
        name: 'count', 
        type: Number, 
        description: 'Number of employees in the company',
        example: 25,
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Company size found successfully', 
        type: CompanySizeResponseDto,
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Small Enterprise',
            description: 'Companies with 10 to 49 employees',
            minEmployees: 10,
            maxEmployees: 49,
            requiresDisabilityQuota: false,
            disabilityQuotaPercentage: null,
            isActive: true,
            sortOrder: 1,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid employee count' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiResponse({ status: 404, description: 'Company size not found for the given employee count' })
    async findByEmployeeCount(@Query() query: CompanySizeQueryDto): Promise<CompanySizeResponseDto> {
        return this.companySizesService.findByEmployeeCount(query.count);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get company size by ID',
        description: 'Retrieve a specific company size by its unique identifier' 
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Unique identifier of the company size',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Company size found successfully', 
        type: CompanySizeResponseDto,
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Small Enterprise',
            description: 'Companies with 10 to 49 employees',
            minEmployees: 10,
            maxEmployees: 49,
            requiresDisabilityQuota: false,
            disabilityQuotaPercentage: null,
            isActive: true,
            sortOrder: 1,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiResponse({ status: 404, description: 'Company size not found' })
    async findOne(@Param('id') id: string): Promise<CompanySizeResponseDto> {
        return this.companySizesService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ 
        summary: 'Create new company size',
        description: 'Create a new company size category. Requires admin or super-admin role.' 
    })
    @ApiBody({
        type: CreateCompanySizeDto,
        description: 'Company size data to create',
        examples: {
            smallEnterprise: {
                summary: 'Small Enterprise Example',
                value: {
                    name: 'Small Enterprise',
                    description: 'Companies with 10 to 49 employees',
                    minEmployees: 10,
                    maxEmployees: 49,
                    requiresDisabilityQuota: false,
                    isActive: true,
                    sortOrder: 1
                }
            },
            largeEnterprise: {
                summary: 'Large Enterprise Example',
                value: {
                    name: 'Large Enterprise',
                    description: 'Companies with 100 or more employees',
                    minEmployees: 100,
                    maxEmployees: null,
                    requiresDisabilityQuota: true,
                    disabilityQuotaPercentage: 2.00,
                    isActive: true,
                    sortOrder: 3
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Company size created successfully', 
        type: CompanySizeResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    async create(@Body() createData: CreateCompanySizeDto): Promise<CompanySizeResponseDto> {
        return this.companySizesService.create(createData);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ 
        summary: 'Update company size',
        description: 'Update an existing company size category. Requires admin or super-admin role.' 
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Unique identifier of the company size to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateCompanySizeDto,
        description: 'Partial company size data to update',
        examples: {
            updateName: {
                summary: 'Update Name Example',
                value: {
                    name: 'Medium Enterprise'
                }
            },
            updateEmployeeRange: {
                summary: 'Update Employee Range Example',
                value: {
                    minEmployees: 50,
                    maxEmployees: 99
                }
            },
            updateQuotaInfo: {
                summary: 'Update Quota Information Example',
                value: {
                    requiresDisabilityQuota: true,
                    disabilityQuotaPercentage: 3.00
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Company size updated successfully', 
        type: CompanySizeResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Company size not found' })
    async update(@Param('id') id: string, @Body() updateData: UpdateCompanySizeDto): Promise<CompanySizeResponseDto> {
        return this.companySizesService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete company size',
        description: 'Soft delete a company size by setting isActive to false. Requires admin or super-admin role.' 
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Unique identifier of the company size to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Company size deleted successfully (soft delete)',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Company size deleted successfully' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Company size not found' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.companySizesService.remove(id);
    }
} 