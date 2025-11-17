import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Patch, 
  Delete,
  UseGuards, 
  HttpStatus, 
  NotFoundException, 
  BadRequestException,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationQueryDto, ApplicationPageQueryDto } from './dto/application-query.dto';
import { ApplicationResponseDto, PaginatedApplicationsResponseDto, PagedApplicationsResponseDto } from './dto/application-response.dto';
import { ApplicationPaginationDto } from './dto/application-pagination.dto';
import { AddFeedbackDto } from './dto/add-feedback.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StorageService } from '../../storage/storage.service';
import { FileUpload } from '../../storage/storage.interface';

/**
 * Controller for managing job applications
 * Handles CRUD operations and business logic endpoints
 */
@ApiTags('applications')
@ApiBearerAuth('JWT-auth')
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly storageService: StorageService
  ) {}

  /**
   * Create a new job application
   */
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:create')
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobOfferId: { type: 'string', format: 'uuid' },
        candidateId: { type: 'string', format: 'uuid' },
        supportingNgoId: { type: 'string', format: 'uuid' },
        coverLetter: { type: 'string' },
        motivationLetter: { type: 'string' },
        additionalNotes: { type: 'string' },
        portfolioUrl: { type: 'string', format: 'uri' },
        accommodationRequests: { type: 'string' },
        needsAccessibilitySupport: { type: 'boolean' },
        needsTransportSupport: { type: 'boolean' },
        needsInterpreterSupport: { type: 'boolean' },
        consentToShare: { type: 'boolean' },
        consentToFollow: { type: 'boolean' },
        cv: { type: 'string', format: 'binary', description: 'CV file' },
        motivationLetterFile: { type: 'string', format: 'binary', description: 'Motivation letter file' },
        attachments: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Additional attachments' }
      },
      required: ['jobOfferId', 'candidateId'],
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Application created successfully',
    type: ApplicationResponseDto
  })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cv', maxCount: 1 },
    { name: 'motivationLetterFile', maxCount: 1 },
    { name: 'attachments', maxCount: 10 }
  ]))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { cv?: FileUpload[], motivationLetterFile?: FileUpload[], attachments?: FileUpload[] }
  ): Promise<ApplicationResponseDto> {
    const createApplicationDto: CreateApplicationDto = {
      jobOfferId: body.jobOfferId,
      candidateId: body.candidateId,
      supportingNgoId: body.supportingNgoId,
      coverLetter: body.coverLetter,
      motivationLetter: body.motivationLetter,
      additionalNotes: body.additionalNotes,
      portfolioUrl: body.portfolioUrl,
      accommodationRequests: body.accommodationRequests,
      needsAccessibilitySupport: body.needsAccessibilitySupport === 'true',
      needsTransportSupport: body.needsTransportSupport === 'true',
      needsInterpreterSupport: body.needsInterpreterSupport === 'true',
      consentToShare: body.consentToShare !== 'false',
      consentToFollow: body.consentToFollow !== 'false'
    };

    // Handle CV file upload
    if (files?.cv && files.cv.length > 0) {
      const cvFile = files.cv[0];
      const fileInfo = await this.storageService.storeFile(cvFile, 'applications/cvs');
      createApplicationDto.cvFileUrl = fileInfo.path;
    }

    // Handle motivation letter file upload
    if (files?.motivationLetterFile && files.motivationLetterFile.length > 0) {
      const motivationFile = files.motivationLetterFile[0];
      const fileInfo = await this.storageService.storeFile(motivationFile, 'applications/motivation-letters');
      createApplicationDto.motivationLetter = fileInfo.path;
    }

    // Handle additional attachments
    if (files?.attachments && files.attachments.length > 0) {
      const uploadedFiles: string[] = [];
      
      for (const file of files.attachments) {
        const fileInfo = await this.storageService.storeFile(file, 'applications/attachments');
        uploadedFiles.push(fileInfo.path);
      }
      
      if (uploadedFiles.length > 0) {
        createApplicationDto.attachmentUrls = JSON.stringify(uploadedFiles);
      }
    }

    const application = await this.applicationsService.create(createApplicationDto);
    return new ApplicationResponseDto(application, true);
  }

  /**
   * Get all applications with filtering and pagination
   */
  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get all applications with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findAll(@Query() query: ApplicationPaginationDto): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findWithStandardPagination(query);
  }

  /**
   * Get applications with page-based pagination
   */
  @Get('page')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get applications with page-based pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findAllPaged(@Query() query: ApplicationPageQueryDto): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findWithPagePagination(query);
  }

  /**
   * Get application statistics
   */
  @Get('statistics')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application statistics retrieved successfully'
  })
  async getStatistics(@Query() filters: ApplicationQueryDto) {
    return this.applicationsService.getStatistics(filters);
  }

  /**
   * Get applications for a specific job offer (for employers)
   */
  @Get('job-offer/:jobOfferId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get applications for a specific job offer' })
  @ApiParam({ name: 'jobOfferId', description: 'The ID of the job offer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications for job offer retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findByJobOffer(
    @Param('jobOfferId') jobOfferId: string,
    @Query() query: ApplicationPaginationDto
  ): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findWithStandardPagination(query, { jobOfferId });
  }

  /**
   * Get applications for a specific company (for all job offers of the company)
   */
  @Get('company/:companyId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get applications for a specific company' })
  @ApiParam({ name: 'companyId', description: 'The ID of the company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications for company retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() query: ApplicationPaginationDto
  ): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findByCompany(companyId, query);
  }

  /**
   * Get applications by a specific candidate
   */
  @Get('candidate/:candidateId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get applications by a specific candidate' })
  @ApiParam({ name: 'candidateId', description: 'The ID of the candidate' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications by candidate retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findByCandidate(
    @Param('candidateId') candidateId: string,
    @Query() query: ApplicationPaginationDto
  ): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findWithStandardPagination(query, { candidateId });
  }

  /**
   * Get applications supported by a specific NGO
   */
  @Get('ngo/:ngoId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get applications supported by a specific NGO' })
  @ApiParam({ name: 'ngoId', description: 'The ID of the NGO' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications by NGO retrieved successfully',
    type: PagedApplicationsResponseDto
  })
  async findByNgo(
    @Param('ngoId') ngoId: string,
    @Query() query: ApplicationPaginationDto
  ): Promise<PagedApplicationsResponseDto> {
    return this.applicationsService.findWithStandardPagination(query, { supportingNgoId: ngoId });
  }

  /**
   * Get a specific application by ID
   */
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:read')
  @ApiOperation({ summary: 'Get a specific application by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the application' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Application retrieved successfully',
    type: ApplicationResponseDto
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  async findOne(@Param('id') id: string): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.findOne(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return new ApplicationResponseDto(application, true);
  }

  /**
   * Update application status (typically by employer)
   */
  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:update')
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id', description: 'The ID of the application' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Application status updated successfully',
    type: ApplicationResponseDto
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.updateStatus(id, updateStatusDto);
    return new ApplicationResponseDto(application, true);
  }

  /**
   * Withdraw an application (by candidate or NGO)
   */
  @Delete(':id/withdraw')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:delete')
  @ApiOperation({ summary: 'Withdraw an application' })
  @ApiParam({ name: 'id', description: 'The ID of the application' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Application withdrawn successfully',
    type: ApplicationResponseDto
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  async withdraw(
    @Param('id') id: string,
    @Body('userId') userId: string
  ): Promise<ApplicationResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    const application = await this.applicationsService.withdraw(id, userId);
    return new ApplicationResponseDto(application, true);
  }

  /**
   * Add feedback to an application
   */
  @Post(':id/feedback')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('applications:update')
  @ApiOperation({ summary: 'Add feedback to an application' })
  @ApiParam({ name: 'id', description: 'The ID of the application' })
  @ApiBody({ type: AddFeedbackDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Feedback added successfully',
    type: ApplicationResponseDto
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  async addFeedback(
    @Param('id') id: string,
    @Body() addFeedbackDto: AddFeedbackDto
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.addFeedback(
      id, 
      addFeedbackDto.feedback, 
      addFeedbackDto.feedbackType
    );
    return new ApplicationResponseDto(application, true);
  }
} 