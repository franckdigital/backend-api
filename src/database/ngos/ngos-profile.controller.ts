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
import { NgoCandidatePaginationDto } from './dto/ngo-candidate-pagination.dto';
import { PaginatedNgoCandidatesResponseDto } from './dto/paginated-ngo-candidates-response.dto';
import { NgoResponseDto } from './dto/ngo-response.dto';
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
    ApiQuery,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RateLimit } from '../../auth/decorators/throttle.decorator';

@ApiTags('ngos-profile')
@Controller('ngos-profile')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class NgosProfileController {
    constructor(private readonly ngosService: NgosService) { }

    @Post()
    @Roles('ngo')
    @RequirePermissions('ngos_profile:create')
    @RateLimit(3, 300) // 3 requests per 5 minutes
    @ApiOperation({
        summary: 'Create NGO profile',
        description: 'Creates a comprehensive NGO profile for the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'NGO profile created successfully',
        type: NgoResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or user already has an NGO',
    })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async createNgoProfile(
        @Body() createNgoDto: CreateNgoDto,
        @Request() req,
    ): Promise<NgoResponseDto> {
        return this.ngosService.createNgo(createNgoDto, req.user.userId);
    }

    @Get()
    @Roles('ngo')
    @RequirePermissions('ngos_profile:read')
    @ApiOperation({
        summary: 'Get NGO profile',
        description: 'Returns the NGO profile for the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'NGO profile retrieved successfully',
        type: NgoResponseDto,
    })
    @ApiNotFoundResponse({ description: 'NGO profile not found' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async getNgoProfile(@Request() req): Promise<NgoResponseDto> {
        return this.ngosService.findNgoByUserId(req.user.userId);
    }

    @Put()
    @Roles('ngo')
    @RequirePermissions('ngos_profile:update')
    @RateLimit(5, 300) // 5 requests per 5 minutes
    @ApiOperation({
        summary: 'Update NGO profile',
        description: 'Updates the NGO profile for the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'NGO profile updated successfully',
        type: NgoResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'NGO profile not found' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async updateNgoProfile(
        @Body() updateNgoDto: UpdateNgoDto,
        @Request() req,
    ): Promise<NgoResponseDto> {
        return this.ngosService.updateNgoByUserId(req.user.userId, updateNgoDto);
    }

    @Delete()
    @Roles('ngo')
    @RequirePermissions('ngos_profile:delete')
    @RateLimit(1, 300) // 1 request per 5 minutes
    @ApiOperation({
        summary: 'Delete NGO profile',
        description: 'Deletes the NGO profile for the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'NGO profile deleted successfully',
    })
    @ApiNotFoundResponse({ description: 'NGO profile not found' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated' })
    async deleteNgoProfile(@Request() req): Promise<{ message: string }> {
        await this.ngosService.deleteNgoByUserId(req.user.userId);
        return { message: 'NGO profile deleted successfully' };
    }

    @Post('candidates')
    @Roles('ngo')
    @RequirePermissions('ngos_profile_candidates:create')
    @RateLimit(10, 300) // 10 requests per 5 minutes
    @ApiOperation({
        summary: 'Create candidate for authenticated NGO',
        description: 'Creates a new candidate associated with the authenticated NGO',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Candidate created successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or email already in use',
    })
    @ApiUnauthorizedResponse({ description: 'Not authenticated or not an NGO' })
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

                // User roles
                roles: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001'],
                    description: 'Array of role IDs assigned to the user' 
                },

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
    async createNgoCandidate(
        @Body() createCandidateDto: CreateNgoCandidateDto | any,
        @Request() req,
        @UploadedFiles()
        files: {
            profilePhoto?: Express.Multer.File[];
            cvFile?: Express.Multer.File[];
            videoFile?: Express.Multer.File[];
            disabilityCertificate?: Express.Multer.File[];
            portfolioFiles?: Express.Multer.File[];
        },
    ): Promise<any> {
        const ngo = await this.ngosService.findNgoByUserId(req.user.userId);
        return this.ngosService.createNgoCandidate(ngo.id, createCandidateDto, files);
    }

    @Get('candidates')
    @Roles('ngo')
    @RequirePermissions('ngos_profile_candidates:read')
    @ApiOperation({
        summary: 'Get paginated candidates for authenticated NGO',
        description: 'Returns paginated and filtered candidates associated with the authenticated NGO',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)', example: 1 })
    @ApiQuery({ name: 'size', required: false, type: Number, description: 'Number of items per page', example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search text in candidate name, email, professional summary, or skills' })
    @ApiQuery({ name: 'isAvailable', required: false, type: Boolean, description: 'Filter by availability status' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
    @ApiQuery({ name: 'isProfileComplete', required: false, type: Boolean, description: 'Filter by profile completion status' })
    @ApiQuery({ name: 'disabilityTypeId', required: false, type: String, description: 'Filter by disability type ID' })
    @ApiQuery({ name: 'educationLevelId', required: false, type: String, description: 'Filter by education level ID' })
    @ApiQuery({ name: 'experienceLevelId', required: false, type: String, description: 'Filter by experience level ID' })
    @ApiQuery({ name: 'professionId', required: false, type: String, description: 'Filter by profession ID' })
    @ApiQuery({ name: 'locationId', required: false, type: String, description: 'Filter by location ID' })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'expectedSalaryMin', 'expectedSalaryMax'], description: 'Sort field' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Paginated candidates retrieved successfully',
        type: PaginatedNgoCandidatesResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Not authenticated or not an NGO' })
    async getNgoCandidatesPaginated(
        @Request() req,
        @Query() paginationDto: NgoCandidatePaginationDto,
    ): Promise<PaginatedNgoCandidatesResponseDto> {
        const ngo = await this.ngosService.findNgoByUserId(req.user.userId);
        
        // Ensure required fields have default values
        const options = {
            page: paginationDto.page || 1,
            size: paginationDto.size || 10,
            ...paginationDto,
        };
        
        return this.ngosService.getNgoCandidatesPaginated(ngo.id, options);
    }

    @Get('candidates/all')
    @Roles('ngo')
    @RequirePermissions('ngos_profile_candidates:read')
    @ApiOperation({
        summary: 'Get all candidates for authenticated NGO without pagination',
        description: 'Returns all candidates associated with the authenticated NGO without pagination',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'All candidates retrieved successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Not authenticated or not an NGO' })
    async getAllNgoCandidates(@Request() req): Promise<any[]> {
        const ngo = await this.ngosService.findNgoByUserId(req.user.userId);
        return this.ngosService.getNgoCandidates(ngo.id);
    }

    @Delete('candidates')
    @Roles('ngo')
    @RequirePermissions('ngos_profile_candidates:delete')
    @RateLimit(1, 300) // 1 request per 5 minutes
    @ApiOperation({
        summary: 'Delete all candidates for authenticated NGO',
        description: 'Deletes all candidates associated with the authenticated NGO',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'All candidates deleted successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Not authenticated or not an NGO' })
    async deleteAuthenticatedNgoCandidates(@Request() req): Promise<{ message: string; deletedCount: number }> {
        const ngo = await this.ngosService.findNgoByUserId(req.user.userId);
        const deletedCount = await this.ngosService.deleteNgoCandidates(ngo.id);
        return {
            message: 'All candidates deleted successfully',
            deletedCount,
        };
    }

    @Delete('candidates/:candidateId')
    @Roles('ngo')
    @RequirePermissions('ngos_profile_candidates:delete')
    @RateLimit(10, 300) // 10 requests per 5 minutes
    @ApiOperation({
        summary: 'Delete specific candidate for authenticated NGO',
        description: 'Deletes a specific candidate associated with the authenticated NGO',
    })
    @ApiParam({
        name: 'candidateId',
        description: 'Candidate unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Candidate deleted successfully',
    })
    @ApiNotFoundResponse({ description: 'Candidate not found' })
    @ApiUnauthorizedResponse({ description: 'Not authenticated or not an NGO' })
    async deleteAuthenticatedNgoCandidate(
        @Request() req,
        @Param('candidateId') candidateId: string,
    ): Promise<{ message: string }> {
        const ngo = await this.ngosService.findNgoByUserId(req.user.userId);
        await this.ngosService.deleteCandidateByIdAndNgoId(candidateId, ngo.id);
        return { message: 'Candidate deleted successfully' };
    }
} 