import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ContractTypesService } from './contract-types.service';
import { ContractType } from '../entities/contract-type.entity';
import { CreateContractTypeDto, UpdateContractTypeDto, ContractTypeResponseDto, ContractTypePageQueryDto, PagedContractTypesResponseDto } from './contract-types.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Contract Types')
@Controller('contract-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ContractTypesController {
    constructor(private readonly contractTypesService: ContractTypesService) { }

    @Get('all')
    @ApiOperation({ 
        summary: 'Get all active contract types',
        description: 'Retrieve a list of all active contract types ordered by sort order and name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of contract types',
        type: [ContractTypeResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAll(): Promise<ContractType[]> {
        return this.contractTypesService.findAll();
    }
    
    @Public()
    @Get('complete')
    @ApiOperation({ 
        summary: 'Get all active contract types',
        description: 'Retrieve a list of all active contract types ordered by sort order and name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of contract types',
        type: [ContractTypeResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAllComplete(): Promise<ContractType[]> {
        return this.contractTypesService.findAll();
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get contract types with pagination and search',
        description: 'Retrieve contract types with pagination support and optional search functionality'
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
        example: 'permanent'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of contract types',
        type: PagedContractTypesResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findWithPagination(@Query() queryOptions: ContractTypePageQueryDto): Promise<PagedContractTypesResponseDto> {
        return this.contractTypesService.findWithPagination(queryOptions);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get contract type by ID',
        description: 'Retrieve a specific contract type by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the contract type',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved contract type',
        type: ContractTypeResponseDto
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
        description: 'Contract type not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ContractType> {
        return this.contractTypesService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Create new contract type',
        description: 'Create a new contract type. Requires admin or super-admin role.'
    })
    @ApiBody({
        type: CreateContractTypeDto,
        description: 'Contract type data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created contract type',
        type: ContractTypeResponseDto
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
        description: 'Conflict - Contract type with same name already exists' 
    })
    async create(@Body() createContractTypeDto: CreateContractTypeDto): Promise<ContractType> {
        return this.contractTypesService.create(createContractTypeDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update contract type',
        description: 'Update an existing contract type. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the contract type to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateContractTypeDto,
        description: 'Contract type update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated contract type',
        type: ContractTypeResponseDto
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
        description: 'Contract type not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Contract type with same name already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateContractTypeDto: UpdateContractTypeDto
    ): Promise<ContractType> {
        return this.contractTypesService.update(id, updateContractTypeDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete contract type',
        description: 'Soft delete a contract type by setting isActive to false. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the contract type to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted contract type' 
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
        description: 'Contract type not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.contractTypesService.remove(id);
    }
} 