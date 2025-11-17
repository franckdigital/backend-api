import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, ValidationPipe, UsePipes, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { Candidate } from '../entities/candidate.entity';
import { 
  CandidatePageQueryDto, 
  PagedCandidatesResponseDto, 
  CandidateResponseDto,
  CreateCandidateDto,
  UpdateCandidateDto,
  CandidateStatsDto
} from './candidates.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Candidates')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin', 'company', 'ngo')
  @ApiOperation({ 
    summary: 'Get all active candidates',
    description: 'Retrieve all active candidates with their complete profile information including related entities (user, disability type, education level, etc.). This endpoint is restricted to authorized roles only.'
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved all active candidates', 
    type: [CandidateResponseDto] 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Authorized role required (admin, super-admin, company, ngo)' 
  })
  async findAll(): Promise<Candidate[]> {
    return this.candidatesService.findAll();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin', 'company', 'ngo', 'ministry')
  @ApiOperation({ 
    summary: 'Get candidates with advanced filtering and pagination',
    description: `Retrieve candidates with comprehensive filtering options and pagination support. 
    This endpoint allows searching by various criteria including:
    - Text search across name, professional summary, skills, and biography
    - Filter by profile completion status, availability, and active status
    - Filter by disability type, education level, experience level, and location
    - Filter by presence of CV or video presentation
    
    Results are sorted by profile completion percentage (descending) and creation date (descending).`
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (starts at 1)',
    example: 1,
    type: Number
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: 'Number of candidates per page (max 100)',
    example: 10,
    type: Number
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter candidates by name, professional summary, skills, or biography',
    example: 'software developer javascript',
    type: String
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by candidate active status',
    example: true,
    type: Boolean
  })
  @ApiQuery({
    name: 'isProfileComplete',
    required: false,
    description: 'Filter by profile completion status (profiles with ≥80% completion)',
    example: true,
    type: Boolean
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Filter by candidate availability for work',
    example: true,
    type: Boolean
  })
  @ApiQuery({
    name: 'disabilityTypeId',
    required: false,
    description: 'Filter by specific disability type UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'handicap',
    required: false,
    description: 'Filter by disability type UUID (alternative to disabilityTypeId)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'educationLevelId',
    required: false,
    description: 'Filter by specific education level UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'experienceLevelId',
    required: false,
    description: 'Filter by specific experience level UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'professionId',
    required: false,
    description: 'Filter by specific profession UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    description: 'Filter by specific location UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiQuery({
    name: 'hasCv',
    required: false,
    description: 'Filter candidates who have uploaded a CV',
    example: true,
    type: Boolean
  })
  @ApiQuery({
    name: 'hasVideoPresentation',
    required: false,
    description: 'Filter candidates who have uploaded a video presentation',
    example: true,
    type: Boolean
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved paginated list of candidates with filtering applied',
    type: PagedCandidatesResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Authorized role required (admin, super-admin, company, ngo, ministry)' 
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid query parameters or validation errors'
  })
  async findWithPagination(@Query() queryOptions: CandidatePageQueryDto) {
    const query = {
      ...queryOptions,
      isActive: queryOptions?.isActive ? queryOptions?.isActive : undefined,
      isAvailable: queryOptions?.isAvailable ? queryOptions?.isAvailable : undefined,
      isProfileComplete: queryOptions?.isProfileComplete ? queryOptions?.isProfileComplete : undefined,
    }

    return this.candidatesService.findWithPagination(query);
  }

  @Get('profile')
  @ApiOperation({ 
    summary: 'Get current authenticated user\'s candidate profile',
    description: 'Retrieve the candidate profile associated with the currently authenticated user. This endpoint returns the complete profile information including all related entities.'
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved candidate profile', 
    type: CandidateResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiNotFoundResponse({ 
    description: 'Candidate profile not found for the authenticated user' 
  })
  async getProfile(@Request() req: any): Promise<Candidate> {
    return this.candidatesService.findByUserId(req.user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin', 'ministry')
  @ApiOperation({ 
    summary: 'Get candidate statistics',
    description: `Retrieve comprehensive statistics about candidates including:
    - Total number of candidates
    - Active candidates count
    - Completed profiles count
    - Available candidates count
    - Candidates with CV uploaded
    - Candidates with video presentations
    - Average profile completion rate
    
    This endpoint is restricted to admin, super-admin, and ministry roles for analytics and reporting purposes.`
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved candidate statistics', 
    type: CandidateStatsDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Admin, super-admin, or ministry role required' 
  })
  async getStats() {
    return this.candidatesService.getCandidateStats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin', 'company', 'ngo')
  @ApiOperation({ 
    summary: 'Get candidate profile by ID',
    description: 'Retrieve a specific candidate profile by their unique identifier. This endpoint includes all related information such as user details, disability type, education level, experience level, and location.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candidate',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved candidate profile', 
    type: CandidateResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Authorized role required (admin, super-admin, company, ngo)' 
  })
  @ApiNotFoundResponse({ 
    description: 'Candidate not found with the specified ID' 
  })
  async findOne(@Param('id') id: string): Promise<Candidate> {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new candidate profile',
    description: `Create a new candidate profile for the authenticated user. The profile will be automatically linked to the current user account.
    
    **Important Notes:**
    - Only one candidate profile per user is allowed
    - Profile completion percentage will be automatically calculated
    - The disabilityTypeId is required for profile creation
    - All file URLs should point to valid, accessible resources`
  })
  @ApiBody({
    type: CreateCandidateDto,
    description: 'Candidate profile data',
    examples: {
      'Complete Profile': {
        summary: 'Example of a complete candidate profile',
        value: {
          disabilityTypeId: '123e4567-e89b-12d3-a456-426614174000',
          disabilityDescription: 'Mobility impairment affecting lower limbs, uses wheelchair for mobility',
          educationLevelId: '456e7890-e89b-12d3-a456-426614174000',
          experienceLevelId: '789e0123-e89b-12d3-a456-426614174000',
          professionalSummary: 'Experienced software developer with 5+ years in web development, specializing in accessible applications and inclusive design',
          skills: '["JavaScript", "TypeScript", "React", "Node.js", "Accessibility Testing", "WCAG Guidelines", "Screen Reader Testing"]',
          languages: '["French (Native)", "English (Fluent)", "Spanish (Intermediate)"]',
          locationId: '012e3456-e89b-12d3-a456-426614174000',
          cvFileUrl: 'https://storage.example.com/cvs/candidate-cv.pdf',
          photoUrl: 'https://storage.example.com/photos/candidate-photo.jpg',
          videoPresentation: 'https://storage.example.com/videos/candidate-presentation.mp4',
          biography: 'Passionate about creating inclusive technology solutions that make a difference in people\'s lives. I believe that accessibility should be built into every application from the ground up.',
          expectedSalaryMin: 450000,
          expectedSalaryMax: 650000,
          isAvailable: true,
          availabilityDate: '2024-02-01'
        }
      },
      'Minimal Profile': {
        summary: 'Example of a minimal candidate profile',
        value: {
          disabilityTypeId: '123e4567-e89b-12d3-a456-426614174000',
          disabilityDescription: 'Visual impairment - legally blind',
          professionalSummary: 'Junior developer looking for opportunities in web development',
          isAvailable: true
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Candidate profile successfully created with automatic profile completion calculation', 
    type: CandidateResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input data, validation errors, or candidate profile already exists for this user'
  })
  async create(@Body() createData: CreateCandidateDto, @Request() req: any): Promise<Candidate> {
    // Convert string date to Date object if provided
    const candidateData: any = { ...createData, userId: req.user.id };
    if (candidateData.availabilityDate) {
      candidateData.availabilityDate = new Date(candidateData.availabilityDate);
    }
    
    const candidate = await this.candidatesService.create(candidateData);
    await this.candidatesService.updateProfileCompletion(candidate.id);
    return candidate;
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update candidate profile',
    description: `Update an existing candidate profile with new information. Profile completion percentage will be automatically recalculated after the update.
    
    **Important Notes:**
    - Only provide fields that need to be updated (partial update)
    - Profile completion will be recalculated automatically
    - File URLs should point to valid, accessible resources
    - Salary ranges should be realistic and in local currency`
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candidate to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    type: UpdateCandidateDto,
    description: 'Partial candidate profile data to update',
    examples: {
      'Update Professional Info': {
        summary: 'Update professional information',
        value: {
          professionalSummary: 'Senior software developer with 8+ years of experience in full-stack development',
          skills: '["JavaScript", "TypeScript", "React", "Vue.js", "Node.js", "Python", "Docker", "AWS"]',
          expectedSalaryMin: 550000,
          expectedSalaryMax: 750000
        }
      },
      'Update Availability': {
        summary: 'Update availability status',
        value: {
          isAvailable: false,
          availabilityDate: '2024-06-01'
        }
      },
      'Add Media Files': {
        summary: 'Add CV and video presentation',
        value: {
          cvFileUrl: 'https://storage.example.com/cvs/updated-cv.pdf',
          videoPresentation: 'https://storage.example.com/videos/new-presentation.mp4'
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Candidate profile successfully updated with recalculated completion percentage', 
    type: CandidateResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiNotFoundResponse({ 
    description: 'Candidate not found with the specified ID' 
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input data or validation errors'
  })
  async update(@Param('id') id: string, @Body() updateData: UpdateCandidateDto): Promise<Candidate> {
    // Convert string date to Date object if provided
    const candidateUpdateData: any = { ...updateData };
    if (candidateUpdateData.availabilityDate) {
      candidateUpdateData.availabilityDate = new Date(candidateUpdateData.availabilityDate);
    }
    
    const candidate = await this.candidatesService.update(id, candidateUpdateData);
    await this.candidatesService.updateProfileCompletion(id);
    return candidate;
  }

  @Patch(':id/profile-completion')
  @ApiOperation({ 
    summary: 'Recalculate candidate profile completion percentage',
    description: `Manually trigger recalculation of the profile completion percentage for a specific candidate. 
    
    The completion percentage is calculated based on:
    - Basic information (disability type, education, experience, location) - 33%
    - Professional information (summary, skills, languages, CV) - 33%
    - Additional information (biography, photo, video, salary expectations) - 34%
    
    A profile is considered complete when it reaches ≥80% completion.`
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candidate',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiOkResponse({ 
    description: 'Profile completion percentage successfully recalculated and updated'
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiNotFoundResponse({ 
    description: 'Candidate not found with the specified ID' 
  })
  async updateProfileCompletion(@Param('id') id: string): Promise<void> {
    return this.candidatesService.updateProfileCompletion(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super-admin')
  @ApiOperation({ 
    summary: 'Soft delete candidate profile',
    description: `Soft delete a candidate profile by setting its active status to false. This operation does not permanently remove the data but makes the profile inactive and excludes it from most queries.
    
    **Important Notes:**
    - This is a soft delete operation (data is preserved)
    - Only admin and super-admin roles can perform this operation
    - The candidate profile will be excluded from search results
    - The operation can be reversed by updating the isActive status`
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candidate to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiOkResponse({ 
    description: 'Candidate profile successfully deactivated (soft deleted)'
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Admin or super-admin role required' 
  })
  @ApiNotFoundResponse({ 
    description: 'Candidate not found with the specified ID' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.candidatesService.remove(id);
  }
} 