import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { NgosService } from './ngos.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';
import { CreateNgoCandidateDto } from './dto/create-ngo-candidate.dto';
import { NgoResponseDto } from './dto/ngo-response.dto';
import { PaginatedNgoResponseDto } from './dto/paginated-ngo-response.dto';
// import { CandidateResponseDto } from '../candidates/candidates.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RateLimit } from '../../auth/decorators/throttle.decorator';

@ApiTags('ngos')
@Controller('ngos')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class NgosController {
  constructor(private readonly ngosService: NgosService) {}

  @Get(':id')
  @Roles('admin', 'super-admin', 'ministry', 'company', 'ngo')
  @RequirePermissions('ngos:read')
  @ApiOperation({
    summary: 'Get NGO by ID',
    description: 'Returns NGO details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGO details retrieved successfully',
    type: NgoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getNgoById(@Param('id') id: string): Promise<NgoResponseDto> {
    return this.ngosService.findNgoById(id);
  }
  

  @Get('all')
  @Roles('admin', 'super-admin', 'ministry')
  @RequirePermissions('ngos:list')
  @ApiOperation({
    summary: 'Get all NGOs',
    description: 'Returns all NGOs without pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All NGOs retrieved successfully',
    type: [NgoResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getAllNgos(): Promise<NgoResponseDto[]> {
    return this.ngosService.findAllNgosWithoutPagination();
  }

  @Get()
  @Roles('admin', 'super-admin', 'ministry', 'company')
  @RequirePermissions('ngos:list')
  @ApiOperation({
    summary: 'Get paginated NGOs list',
    description: 'Returns a paginated list of NGOs with optional filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGOs retrieved successfully',
    type: PaginatedNgoResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getNgos(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('search') search?: string,
    @Query('isVerified') isVerified?: boolean,
  ): Promise<PaginatedNgoResponseDto> {
    return this.ngosService.findAllNgos({
      page: Number(page),
      size: Number(size),
      search,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : undefined,
    });
  }


  @Put(':id')
  @Roles('admin', 'super-admin')
  @RequirePermissions('ngos:update')
  @RateLimit(5, 300) // 5 requests per 5 minutes
  @ApiOperation({
    summary: 'Update NGO by ID',
    description: 'Updates NGO details by ID (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGO updated successfully',
    type: NgoResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  async updateNgoById(
    @Param('id') id: string,
    @Body() updateNgoDto: UpdateNgoDto,
  ): Promise<NgoResponseDto> {
    return this.ngosService.updateNgoById(id, updateNgoDto);
  }


  @Delete(':id')
  @Roles('admin', 'super-admin')
  @RequirePermissions('ngos:delete')
  @RateLimit(2, 300) // 2 requests per 5 minutes
  @ApiOperation({
    summary: 'Delete NGO by ID',
    description: 'Deletes NGO by ID (Admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NGO deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'NGO deleted successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  async deleteNgoById(@Param('id') id: string): Promise<{ message: string }> {
    await this.ngosService.deleteNgoById(id);
    return { message: 'NGO deleted successfully' };
  }

  @Delete(':ngoId/candidates')
  @Roles('admin', 'super-admin')
  @RequirePermissions('ngo_candidates:delete')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Delete all candidates managed by NGO',
    description: 'Deletes all candidates associated with the specified NGO',
  })
  @ApiParam({
    name: 'ngoId',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidates deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'All candidates deleted successfully' },
        deletedCount: { type: 'number', example: 5 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  async deleteNgoCandidates(@Param('ngoId') ngoId: string): Promise<{ message: string; deletedCount: number }> {
    const deletedCount = await this.ngosService.deleteNgoCandidates(ngoId);
    return { 
      message: 'All candidates deleted successfully',
      deletedCount 
    };
  }





  // ============================================================================
  // ENDPOINTS FOR MANAGING CANDIDATES BY NGO ID
  // ============================================================================

  @Post(':id/candidates')
  @Roles('admin', 'super-admin', 'ministry')
  @RequirePermissions('ngo_candidates:create')
  @RateLimit(10, 300) // 10 requests per 5 minutes
  @ApiOperation({
    summary: 'Create candidate for specific NGO',
    description: 'Creates a new candidate associated with a specific NGO',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Candidate created successfully',
    // type: CandidateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already in use',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // User basic information
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'Password123', description: 'Optional' },
        contact: { type: 'string', example: '+237123456789' },
        secondaryContact: { type: 'string', example: '+237987654321' },
        sex: { type: 'string', example: 'male' },
        birthDate: { type: 'string', example: '1990-01-15' },
        address: { type: 'string', example: '123 Main Street, Douala, Cameroon' },
        profession: { type: 'string', example: 'Software Developer' },
        
        // Candidate-specific disability information
        disabilityTypeId: { type: 'string', example: 'uuid-disability-type-id' },
        disabilityDescription: { type: 'string', example: 'Mobility impairment affecting lower limbs' },
        
        // Professional information
        educationLevelId: { type: 'string', example: 'uuid-education-level-id' },
        experienceLevelId: { type: 'string', example: 'uuid-experience-level-id' },
        professionId: { type: 'string', example: 'uuid-profession-id' },
        professionalSummary: { type: 'string', example: 'Experienced software developer with expertise in web technologies' },
        skills: { type: 'string', example: '["JavaScript", "TypeScript", "React", "Node.js"]' },
        languages: { type: 'string', example: '[{"name": "English", "level": "Native"}, {"name": "French", "level": "Fluent"}]' },
        
        // Location and preferences
        locationId: { type: 'string', example: 'uuid-location-id' },
        biography: { type: 'string', example: 'Passionate about technology and helping others through accessible solutions.' },
        videoPresentation: { type: 'string', example: 'Short video introducing myself and my skills' },
        expectedSalaryMin: { type: 'number', example: 500000 },
        expectedSalaryMax: { type: 'number', example: 750000 },
        isAvailable: { type: 'boolean', example: true },
        availabilityDate: { type: 'string', example: '2024-02-01' },
        
        // File uploads
        profilePhoto: { type: 'string', format: 'binary', description: 'Profile photo' },
        cvFile: { type: 'string', format: 'binary', description: 'CV/Resume file' },
        videoFile: { type: 'string', format: 'binary', description: 'Video presentation file' },
        disabilityCertificate: { type: 'string', format: 'binary', description: 'Disability certificate' },
        portfolioFiles: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Portfolio files' },
      },
      required: ['firstName', 'lastName', 'email', 'disabilityTypeId'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'cvFile', maxCount: 1 },
      { name: 'videoFile', maxCount: 1 },
      { name: 'disabilityCertificate', maxCount: 1 },
      { name: 'portfolioFiles', maxCount: 5 },
    ]),
  )
  async createCandidateForNgo(
    @Param('id') ngoId: string,
    @Body() createCandidateDto: CreateNgoCandidateDto,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      cvFile?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
      disabilityCertificate?: Express.Multer.File[];
      portfolioFiles?: Express.Multer.File[];
    },
  ): Promise<any> {
    return this.ngosService.createNgoCandidate(
      ngoId,
      createCandidateDto,
      files,
    );
  }

  @Get(':id/candidates/all')
  @Roles('admin', 'super-admin', 'ministry', 'company')
  @RequirePermissions('ngo_candidates:read')
  @ApiOperation({
    summary: 'Get all candidates for specific NGO',
    description: 'Returns all candidates managed by a specific NGO without pagination',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All candidates retrieved successfully',
    // type: [CandidateResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  async getAllCandidatesForNgo(@Param('id') ngoId: string): Promise<any[]> {
    return this.ngosService.getNgoCandidates(ngoId);
  }

  @Get(':id/candidates')
  @Roles('admin', 'super-admin', 'ministry', 'company')
  @RequirePermissions('ngo_candidates:read')
  @ApiOperation({
    summary: 'Get paginated candidates for specific NGO',
    description: 'Returns paginated candidates managed by a specific NGO with optional search',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated candidates retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/CandidateResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            size: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrevious: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO not found' })
  async getPaginatedCandidatesForNgo(
    @Param('id') ngoId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('search') search?: string,
  ): Promise<{ data: any[]; meta: any }> {
    return this.ngosService.getNgoCandidatesPaginated(ngoId, {
      page: Number(page),
      size: Number(size),
      search,
    });
  }

  @Get(':id/candidates/:candidateId')
  @Roles('admin', 'super-admin', 'ministry', 'company')
  @RequirePermissions('ngo_candidates:read')
  @ApiOperation({
    summary: 'Get candidate by ID for specific NGO',
    description: 'Returns a specific candidate managed by a specific NGO',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'candidateId',
    description: 'Candidate unique identifier',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate retrieved successfully',
    // type: CandidateResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO or Candidate not found' })
  async getCandidateByIdForNgo(
    @Param('id') ngoId: string,
    @Param('candidateId') candidateId: string,
  ): Promise<any> {
    return this.ngosService.findCandidateByIdAndNgoId(candidateId, ngoId);
  }

  @Put(':id/candidates/:candidateId')
  @Roles('admin', 'super-admin', 'ministry')
  @RequirePermissions('ngo_candidates:update')
  @RateLimit(5, 300) // 5 requests per 5 minutes
  @ApiOperation({
    summary: 'Update candidate by ID for specific NGO',
    description: 'Updates a specific candidate managed by a specific NGO',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'candidateId',
    description: 'Candidate unique identifier',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate updated successfully',
    // type: CandidateResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO or Candidate not found' })
  async updateCandidateByIdForNgo(
    @Param('id') ngoId: string,
    @Param('candidateId') candidateId: string,
    @Body() updateData: any,
  ): Promise<any> {
    return this.ngosService.updateCandidateByIdAndNgoId(candidateId, ngoId, updateData);
  }

  @Delete(':id/candidates/:candidateId')
  @Roles('admin', 'super-admin')
  @RequirePermissions('ngo_candidates:delete')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Delete candidate by ID for specific NGO',
    description: 'Deletes a specific candidate managed by a specific NGO',
  })
  @ApiParam({
    name: 'id',
    description: 'NGO unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'candidateId',
    description: 'Candidate unique identifier',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Candidate deleted successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'NGO or Candidate not found' })
  async deleteCandidateByIdForNgo(
    @Param('id') ngoId: string,
    @Param('candidateId') candidateId: string,
  ): Promise<{ message: string }> {
    await this.ngosService.deleteCandidateByIdAndNgoId(candidateId, ngoId);
    return { message: 'Candidate deleted successfully' };
  }
} 