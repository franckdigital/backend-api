import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, ValidationPipe, UsePipes, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JobOffersService, JobSearchFilters } from './job-offers.service';
import { JobOffer } from '../entities/job-offer.entity';
import { 
    JobOfferPageQueryDto, 
    PagedJobOffersResponseDto, 
    JobOfferResponseDto, 
    JobOfferStatus,
    CreateJobOfferDto,
    UpdateJobOfferDto,
    JobOfferStatsDto
} from './job-offers.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CompaniesService } from '../companies/companies.service';
import { Public } from '../../common/guards/global-auth.guard';

@ApiTags('Job Offers')
@Controller('job-offers')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class JobOffersController {
    constructor(
        private readonly jobOffersService: JobOffersService,
        private readonly companiesService: CompaniesService
    ) { }

    @Public()
    @Get('search')
    @ApiOperation({ 
        summary: 'Get all published job offers with pagination',
        description: 'Retrieve all published job offers from verified companies with pagination support. Only shows active and visible job offers. Results are ordered by publication date (most recent first).'
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
        description: 'Search term for job title, description, or requirements',
        example: 'software developer'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'isVisible',
        required: false,
        description: 'Filter by visible status',
        example: true
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    @ApiQuery({
        name: 'activitySectorId',
        required: false,
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'contractTypeId',
        required: false,
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'locationId',
        required: false,
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumEducationLevelId',
        required: false,
        description: 'Filter by minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumExperienceLevelId',
        required: false,
        description: 'Filter by minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'isRemoteWork',
        required: false,
        description: 'Filter by remote work possibility',
        example: true
    })
    @ApiQuery({
        name: 'isDisabilityFriendly',
        required: false,
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @ApiQuery({
        name: 'isExclusiveForDisabled',
        required: false,
        description: 'Filter by jobs exclusive for disabled candidates',
        example: true
    })
    @ApiQuery({
        name: 'salaryMin',
        required: false,
        description: 'Filter by minimum salary',
        example: 30000
    })
    @ApiQuery({
        name: 'salaryMax',
        required: false,
        description: 'Filter by maximum salary',
        example: 80000
    })
    @ApiQuery({
        name: 'suitableDisabilityTypeIds',
        required: false,
        description: 'Filter by suitable disability type IDs (comma-separated)',
        example: '123e4567-e89b-12d3-a456-426614174000,456e7890-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of published job offers. Only includes offers from verified companies that can post jobs.',
        type: PagedJobOffersResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid query parameters' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async findAll(@Query() queryOptions: any) {
        // Pour les offres publiées, on force certains filtres par défaut
        const publishedOptions = {
            ...queryOptions,
            isActive: true,
            isVisible: true,
            status: 'published'
        };
        
        return this.jobOffersService.findPublishedOffersWithPagination(publishedOptions);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get job offers with pagination and search',
        description: 'Retrieve job offers with pagination support and comprehensive filtering options'
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
        description: 'Search term for job title, description, or requirements',
        example: 'software developer'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'isVisible',
        required: false,
        description: 'Filter by visible status',
        example: true
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    @ApiQuery({
        name: 'companyId',
        required: false,
        description: 'Filter by company ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'activitySectorId',
        required: false,
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'contractTypeId',
        required: false,
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'locationId',
        required: false,
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumEducationLevelId',
        required: false,
        description: 'Filter by minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumExperienceLevelId',
        required: false,
        description: 'Filter by minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'isRemoteWork',
        required: false,
        description: 'Filter by remote work possibility',
        example: true
    })
    @ApiQuery({
        name: 'isDisabilityFriendly',
        required: false,
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @ApiQuery({
        name: 'isExclusiveForDisabled',
        required: false,
        description: 'Filter by jobs exclusive for disabled candidates',
        example: true
    })
    @ApiQuery({
        name: 'salaryMin',
        required: false,
        description: 'Filter by minimum salary',
        example: 30000
    })
    @ApiQuery({
        name: 'salaryMax',
        required: false,
        description: 'Filter by maximum salary',
        example: 80000
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated list of job offers',
        type: PagedJobOffersResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid query parameters' 
    })
    async findWithPagination(@Query() queryOptions: JobOfferPageQueryDto) {
        const query = {
            ...queryOptions,
            isActive: queryOptions?.isActive ? queryOptions?.isActive : undefined,
            isVisible: queryOptions?.isVisible ? queryOptions?.isVisible : undefined,
            status: queryOptions?.status ? queryOptions?.status : undefined,
            isRemoteWork: queryOptions?.isRemoteWork ? queryOptions?.isRemoteWork : undefined,
            isDisabilityFriendly: queryOptions?.isDisabilityFriendly ? queryOptions?.isDisabilityFriendly : undefined,
            isExclusiveForDisabled: queryOptions?.isExclusiveForDisabled ? queryOptions?.isExclusiveForDisabled : undefined,
            salaryMin: queryOptions?.salaryMin ? queryOptions?.salaryMin : undefined,
            salaryMax: queryOptions?.salaryMax ? queryOptions?.salaryMax : undefined,
        }
        return this.jobOffersService.findWithPagination(query);
    }

    @Public()
    @Get('published')
    @ApiOperation({ 
        summary: 'Search job offers with advanced filters',
        description: 'Search through published job offers using various filters like title, location, salary range, remote work options, and accessibility features. All filters are optional and can be combined.'
    })
    @ApiQuery({ 
        name: 'title', 
        required: false, 
        type: String, 
        description: 'Search in job titles (partial match)',
        example: 'developer'
    })
    @ApiQuery({ 
        name: 'activitySectorId', 
        required: false, 
        type: String, 
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'contractTypeId', 
        required: false, 
        type: String, 
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'locationId', 
        required: false, 
        type: String, 
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'isRemoteWork', 
        required: false, 
        type: Boolean, 
        description: 'Filter by remote work availability',
        example: true
    })
    @ApiQuery({ 
        name: 'isDisabilityFriendly', 
        required: false, 
        type: Boolean, 
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @ApiQuery({ 
        name: 'isExclusiveForDisabled', 
        required: false, 
        type: Boolean, 
        description: 'Filter by jobs exclusive for disabled candidates',
        example: false
    })
    @ApiQuery({ 
        name: 'salaryMin', 
        required: false, 
        type: Number, 
        description: 'Minimum salary filter',
        example: 30000
    })
    @ApiQuery({ 
        name: 'salaryMax', 
        required: false, 
        type: Number, 
        description: 'Maximum salary filter',
        example: 80000
    })
    @ApiQuery({ 
        name: 'experienceLevelId', 
        required: false, 
        type: String, 
        description: 'Filter by experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'educationLevelId', 
        required: false, 
        type: String, 
        description: 'Filter by education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved filtered job offers matching the search criteria',
        type: [JobOfferResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid filter parameters' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async search(@Query() filters: JobSearchFilters): Promise<JobOffer[]> {
        return this.jobOffersService.searchJobOffers(filters);
    }

    @Get('my-offers')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current company job offers with pagination and filters',
        description: 'Retrieve job offers posted by the authenticated company with pagination support and comprehensive filtering options. Includes offers in all statuses (draft, published, paused, closed). Requires company role authentication.'
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
        description: 'Search term for job title, description, or requirements',
        example: 'software developer'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'isVisible',
        required: false,
        description: 'Filter by visible status',
        example: true
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    @ApiQuery({
        name: 'activitySectorId',
        required: false,
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'contractTypeId',
        required: false,
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'locationId',
        required: false,
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumEducationLevelId',
        required: false,
        description: 'Filter by minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumExperienceLevelId',
        required: false,
        description: 'Filter by minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'isRemoteWork',
        required: false,
        description: 'Filter by remote work possibility',
        example: true
    })
    @ApiQuery({
        name: 'isDisabilityFriendly',
        required: false,
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @ApiQuery({
        name: 'isExclusiveForDisabled',
        required: false,
        description: 'Filter by jobs exclusive for disabled candidates',
        example: true
    })
    @ApiQuery({
        name: 'salaryMin',
        required: false,
        description: 'Filter by minimum salary',
        example: 30000
    })
    @ApiQuery({
        name: 'salaryMax',
        required: false,
        description: 'Filter by maximum salary',
        example: 80000
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved paginated and filtered company job offers. Returns offers with pagination metadata.',
        type: PagedJobOffersResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid query parameters' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have company role' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async getMyOffers(@Query() queryOptions: any, @Request() req: any) {
        // Récupérer la compagnie à partir de l'userId
        const company = await this.companiesService.findByUserId(req.user.userId);

        if (!company) {
            throw new Error('No company found for this user');
        }
        
        // Utiliser la méthode spécifique pour les offres de l'entreprise connectée
        return this.jobOffersService.findMyOffersWithPagination(queryOptions, company.id);
    }

    @Get('my-offers/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get all current company job offers with filters (no pagination)',
        description: 'Retrieve all job offers posted by the authenticated company with comprehensive filtering options but without pagination. Includes offers in all statuses (draft, published, paused, closed). Returns all matching results in a single response. Requires company role authentication.'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search term for job title, description, or requirements',
        example: 'software developer'
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        description: 'Filter by active status',
        example: true
    })
    @ApiQuery({
        name: 'isVisible',
        required: false,
        description: 'Filter by visible status',
        example: true
    })
    @ApiQuery({
        name: 'status',
        required: false,
        description: 'Filter by job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    @ApiQuery({
        name: 'activitySectorId',
        required: false,
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'contractTypeId',
        required: false,
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'locationId',
        required: false,
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumEducationLevelId',
        required: false,
        description: 'Filter by minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'minimumExperienceLevelId',
        required: false,
        description: 'Filter by minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({
        name: 'isRemoteWork',
        required: false,
        description: 'Filter by remote work possibility',
        example: true
    })
    @ApiQuery({
        name: 'isDisabilityFriendly',
        required: false,
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @ApiQuery({
        name: 'isExclusiveForDisabled',
        required: false,
        description: 'Filter by jobs exclusive for disabled candidates',
        example: true
    })
    @ApiQuery({
        name: 'salaryMin',
        required: false,
        description: 'Filter by minimum salary',
        example: 30000
    })
    @ApiQuery({
        name: 'salaryMax',
        required: false,
        description: 'Filter by maximum salary',
        example: 80000
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved all filtered company job offers without pagination. Returns array of job offers matching the criteria.',
        type: [JobOfferResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid query parameters' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have company role' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async getAllMyOffers(@Query() queryOptions: any, @Request() req: any): Promise<JobOffer[]> {
        // Récupérer la compagnie à partir de l'userId
        const company = await this.companiesService.findByUserId(req.user.userId);

        if (!company) {
            throw new Error('No company found for this user');
        }
        
        // Utiliser la nouvelle méthode spécifique pour récupérer toutes les offres sans pagination
        return this.jobOffersService.findMyOffers(queryOptions, company.id);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get job offer by ID',
        description: 'Retrieve a specific job offer by its unique identifier. This endpoint automatically increments the view count for analytics purposes. Returns complete job offer details including company information and related entities.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved job offer with complete details. View count has been incremented.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async findOne(@Param('id') id: string): Promise<JobOffer> {
        // Increment view count
        await this.jobOffersService.incrementViewCount(id);
        return this.jobOffersService.findOne(id);
    }


    @Public()
    @Get(':id/details')
    @ApiOperation({ 
        summary: 'Get job offer by ID',
        description: 'Retrieve a specific published job offer by its unique identifier. This endpoint automatically increments the view count for analytics purposes. Returns complete job offer details including company information and related entities. Only published job offers are accessible.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved published job offer with complete details. View count has been incremented.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist or the job offer is not published' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 500,
        description: 'Internal server error' 
    })
    async findOnePublic(@Param('id') id: string): Promise<JobOffer> {
        // First, get the job offer to check its status
        const jobOffer = await this.jobOffersService.findOne(id);
        
        // Check if the job offer is published
        if (jobOffer.status !== JobOfferStatus.PUBLISHED) {
            throw new NotFoundException('Job offer not found or not published');
        }
        
        // Only increment view count for published offers
        await this.jobOffersService.incrementViewCount(id);
        
        return jobOffer;
    }

    @Get(':id/stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get job offer analytics and statistics',
        description: 'Retrieve detailed analytics for a specific job offer including view counts, application counts, and performance metrics. Available to job offer owners, admins, and super-admins only.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved job offer statistics and analytics data',
        type: JobOfferStatsDto
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to view this job offer statistics' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async getStats(@Param('id') id: string): Promise<any> {
        return this.jobOffersService.getJobOfferStats(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Create a new job offer',
        description: 'Create a new job offer for the authenticated company. The job offer will be created in draft status by default. Company must be verified and authorized to post job offers. All job offer data is validated before creation.'
    })
    @ApiBody({
        description: 'Job offer creation data',
        type: CreateJobOfferDto,
        examples: {
            example1: {
                summary: 'Full-time Developer Position',
                description: 'Example of a complete job offer for a full-time developer position',
                value: {
                    title: 'Senior Frontend Developer',
                    description: 'We are looking for an experienced frontend developer to join our dynamic team. You will be responsible for developing user-facing applications using modern technologies.',
                    requirements: '5+ years of experience with React, TypeScript knowledge, Agile methodology experience',
                    activitySectorId: '123e4567-e89b-12d3-a456-426614174000',
                    contractTypeId: '123e4567-e89b-12d3-a456-426614174000',
                    locationId: '123e4567-e89b-12d3-a456-426614174000',
                    salaryMin: 45000,
                    salaryMax: 65000,
                    salaryCurrency: 'EUR',
                    benefits: 'Health insurance, meal vouchers, flexible working hours',
                    isRemoteWork: true,
                    isDisabilityFriendly: true,
                    isExclusiveForDisabled: false,
                    suitableDisabilityTypeIds: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000'],
                    applicationDeadline: '2024-12-31T23:59:59.000Z'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Job offer successfully created. Returns the created job offer with generated ID and timestamps.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid input data or validation errors' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Company not verified or not authorized to post job offers' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async create(@Body() createData: CreateJobOfferDto, @Request() req: any): Promise<JobOffer> {
        // Récupérer la compagnie à partir de l'userId
        const company = await this.companiesService.findByUserId(req.user.userId);

        if (!company) {
            throw new Error('No company found for this user');
        }

        // Vérifier si la compagnie est vérifiée et peut poster des offres
        const isVerified = await this.companiesService.isCompanyVerified(company.id);
        if (!isVerified) {
            throw new Error('Company is not verified or not authorized to post job offers');
        }

        // Créer l'offre avec l'id de la compagnie
        return this.jobOffersService.create(createData, company.id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update job offer',
        description: 'Update an existing job offer. Companies can only update their own job offers. Admins and super-admins can update any job offer. All provided fields will be updated, others remain unchanged.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer to update',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiBody({
        description: 'Job offer update data. Only include fields you want to update.',
        type: UpdateJobOfferDto,
        examples: {
            partialUpdate: {
                summary: 'Partial Update Example',
                description: 'Example of updating only specific fields',
                value: {
                    title: 'Senior Full-Stack Developer',
                    salaryMax: 70000,
                    isRemoteWork: true,
                    benefits: 'Health insurance, meal vouchers, flexible working hours, remote work options',
                    suitableDisabilityTypeIds: ['123e4567-e89b-12d3-a456-426614174000']
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Job offer successfully updated. Returns the updated job offer with all current data.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid input data or validation errors' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to update this job offer' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async update(@Param('id') id: string, @Body() updateData: UpdateJobOfferDto, @Request() req: any): Promise<JobOffer> {
        const companyId = req.user.userType === 'company' ? req.user.companyId : undefined;
        return this.jobOffersService.update(id, updateData, companyId);
    }

    @Patch(':id/publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Publish job offer',
        description: 'Publish a job offer to make it visible to candidates. The job offer status will be changed to "published", visibility will be set to true, and the publication date will be recorded. Only verified companies can publish job offers.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer to publish',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Job offer successfully published. The offer is now visible to candidates and the publication timestamp has been set.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format or job offer cannot be published' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to publish this job offer or company is not verified' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async publish(@Param('id') id: string, @Request() req: any): Promise<JobOffer> {
        const companyId = req.user.userType === 'company' ? req.user.companyId : undefined;
        return this.jobOffersService.publish(id, companyId);
    }

    @Patch(':id/pause')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Pause job offer',
        description: 'Temporarily pause a published job offer. The job offer status will be changed to "paused" and visibility will be set to false, making it invisible to candidates. The offer can be republished later.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer to pause',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Job offer successfully paused. The offer is no longer visible to candidates but can be republished.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format or job offer cannot be paused' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to pause this job offer' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async pause(@Param('id') id: string, @Request() req: any): Promise<JobOffer> {
        const companyId = req.user.userType === 'company' ? req.user.companyId : undefined;
        return this.jobOffersService.pause(id, companyId);
    }

    @Patch(':id/close')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Close job offer permanently',
        description: 'Permanently close a job offer when the position has been filled or is no longer available. The job offer status will be changed to "closed", visibility will be set to false, and the closure date will be recorded. This action is typically irreversible.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer to close',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Job offer successfully closed. The offer is permanently closed and no longer visible to candidates.',
        type: JobOfferResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format or job offer cannot be closed' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to close this job offer' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async close(@Param('id') id: string, @Request() req: any): Promise<JobOffer> {
        const companyId = req.user.userType === 'company' ? req.user.companyId : undefined;
        return this.jobOffersService.close(id, companyId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('company', 'admin', 'super-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Soft delete job offer',
        description: 'Soft delete a job offer by setting its active status to false. The job offer record is preserved in the database for audit purposes but becomes invisible and inaccessible. Companies can only delete their own job offers unless they are admins or super-admins.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the job offer to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: 'string'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Job offer successfully soft deleted. The offer is no longer active but preserved for audit purposes.' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing authentication token' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User does not have permission to delete this job offer' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Job offer not found - The specified ID does not exist or is already deleted' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error' 
    })
    async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
        const companyId = req.user.userType === 'company' ? req.user.companyId : undefined;
        return this.jobOffersService.remove(id, companyId);
    }
} 