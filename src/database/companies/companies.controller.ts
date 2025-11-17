import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe, UsePipes, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { Company } from '../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto, CompanyPageQueryDto, PagedCompaniesResponseDto } from './companies.dto';
import { ValidateCompanyDto, CompanyValidationResponseDto } from './dto/company-validation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get('all')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry')
    @ApiOperation({ 
        summary: 'Get all companies',
        description: 'Retrieve a list of all active companies. Requires admin, super-admin, or ministry role.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of companies',
        type: [CompanyResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin, super-admin, or ministry role required' 
    })
    async findAll(): Promise<Company[]> {
        return this.companiesService.findAll();
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry', 'candidate', 'ngo')
    @ApiOperation({ 
        summary: 'Get companies with pagination and search',
        description: 'Retrieve companies with pagination support and comprehensive filtering options'
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
        description: 'Search term for company name, description, registration number, or tax number',
        example: 'tech solutions'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'isVerified',
        required: false,
        description: 'Filter by verification status',
        example: true
    })
    @ApiQuery({
        name: 'isCompliantWithLaw',
        required: false,
        description: 'Filter by compliance status',
        example: true
    })
    @ApiQuery({
        name: 'isSubjectToDisabilityQuota',
        required: false,
        description: 'Filter by disability quota subject status',
        example: true
    })
    @ApiQuery({
        name: 'activitySectorId',
        required: false,
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'companySizeId',
        required: false,
        description: 'Filter by company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'locationId',
        required: false,
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minEmployeeCount',
        required: false,
        description: 'Filter by minimum employee count',
        example: 50
    })
    @ApiQuery({
        name: 'maxEmployeeCount',
        required: false,
        description: 'Filter by maximum employee count',
        example: 500
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of companies',
        type: PagedCompaniesResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Authorized role required' 
    })
    async findWithPagination(@Query() queryOptions: CompanyPageQueryDto): Promise<PagedCompaniesResponseDto> {
        return this.companiesService.findWithPagination(queryOptions);
    }

    @Get('profile')
    @UseGuards(RolesGuard)
    @Roles('company')
    @ApiOperation({ 
        summary: 'Get current company profile',
        description: 'Retrieve the current authenticated company\'s profile. Requires company role.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved company profile',
        type: CompanyResponseDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Company role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Company profile not found' 
    })
    async getProfile(@Request() req: any): Promise<Company> {
        return this.companiesService.findByUserId(req.user.userId);
    }

    @Get('compliance/compliant')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry')
    @ApiOperation({ 
        summary: 'Get companies in compliance with disability quota',
        description: 'Retrieve a list of companies that are compliant with disability quota regulations'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of compliant companies',
        type: [CompanyResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin, super-admin, or ministry role required' 
    })
    async getCompliantCompanies(): Promise<Company[]> {
        return this.companiesService.findCompliantCompanies();
    }

    @Get('compliance/non-compliant')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry')
    @ApiOperation({ 
        summary: 'Get companies not in compliance with disability quota',
        description: 'Retrieve a list of companies that are not compliant with disability quota regulations'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of non-compliant companies',
        type: [CompanyResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin, super-admin, or ministry role required' 
    })
    async getNonCompliantCompanies(): Promise<Company[]> {
        return this.companiesService.findNonCompliantCompanies();
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry', 'candidate', 'ngo')
    @ApiOperation({ 
        summary: 'Get company by ID',
        description: 'Retrieve a specific company by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved company',
        type: CompanyResponseDto
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
        description: 'Forbidden - Authorized role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Company not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Company> {
        return this.companiesService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('company')
    @ApiOperation({ 
        summary: 'Create company profile',
        description: 'Create a new company profile. Requires company role. User ID is automatically assigned from authenticated user.'
    })
    @ApiBody({
        type: CreateCompanyDto,
        description: 'Company profile data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created company profile',
        type: CompanyResponseDto
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
        description: 'Forbidden - Company role required' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Company profile already exists for this user' 
    })
    async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req: any): Promise<Company> {
        const createData = { ...createCompanyDto, userId: req.user.id };
        const company = await this.companiesService.create(createData);
        await this.companiesService.updateProfileCompletion(company.id);
        return company;
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update company profile',
        description: 'Update an existing company profile. Company users can only update their own profile.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateCompanyDto,
        description: 'Company profile update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated company profile',
        type: CompanyResponseDto
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
        description: 'Forbidden - Authorized role required or not your company' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Company not found' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateCompanyDto: UpdateCompanyDto
    ): Promise<Company> {
        const company = await this.companiesService.update(id, updateCompanyDto);
        await this.companiesService.updateProfileCompletion(id);
        return company;
    }

    @Patch(':id/compliance')
    @UseGuards(RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update company compliance status',
        description: 'Recalculate and update the company\'s compliance status with disability quota regulations'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated compliance status' 
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
        description: 'Forbidden - Authorized role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Company not found' 
    })
    async updateComplianceStatus(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.companiesService.updateComplianceStatus(id);
    }

    @Patch(':id/profile-completion')
    @UseGuards(RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update company profile completion percentage',
        description: 'Recalculate and update the company\'s profile completion percentage'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated profile completion percentage' 
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
        description: 'Forbidden - Authorized role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Company not found' 
    })
    async updateProfileCompletion(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.companiesService.updateProfileCompletion(id);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete company profile',
        description: 'Soft delete a company profile by setting isActive to false. Requires admin or super-admin role.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted company profile' 
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
        description: 'Company not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.companiesService.remove(id);
    }

    @Get('pending-verification')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry')
    @ApiOperation({ 
        summary: 'Get companies pending verification',
        description: 'Retrieve a list of companies that are pending admin verification'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of pending companies',
        type: [CompanyResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin, super-admin, or ministry role required' 
    })
    async getPendingCompanies(): Promise<Company[]> {
        return this.companiesService.findPendingVerification();
    }

    @Patch(':id/validate')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Validate or reject a company',
        description: 'Approve or reject a company registration. This determines whether the company can post job offers.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the company to validate',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: ValidateCompanyDto,
        description: 'Validation decision and notes'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Company validation completed successfully',
        type: CompanyValidationResponseDto
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
        description: 'Company not found' 
    })
    async validateCompany(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() validateCompanyDto: ValidateCompanyDto
    ): Promise<CompanyValidationResponseDto> {
        return this.companiesService.validateCompany(id, validateCompanyDto);
    }

    @Get('verified')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin', 'ministry', 'candidate', 'ngo')
    @ApiOperation({ 
        summary: 'Get verified companies',
        description: 'Retrieve a list of companies that have been verified and can post job offers'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of verified companies',
        type: [CompanyResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Authorized role required' 
    })
    async getVerifiedCompanies(): Promise<Company[]> {
        return this.companiesService.findVerifiedCompanies();
    }
} 