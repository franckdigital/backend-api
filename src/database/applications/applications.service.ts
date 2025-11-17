import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Application } from '../entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto, ApplicationStatus } from './dto/update-application-status.dto';
import { ApplicationQueryDto, ApplicationPageQueryDto } from './dto/application-query.dto';
import { ApplicationResponseDto, PaginatedApplicationsResponseDto, PagedApplicationsResponseDto } from './dto/application-response.dto';
import { ApplicationPaginationDto } from './dto/application-pagination.dto';
import { QueryService } from '../../common/services/query.service';

/**
 * Service responsible for managing job applications
 * Handles CRUD operations and business logic for applications
 */
@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly queryService: QueryService
  ) {}

  /**
   * Create a new job application
   * @param createApplicationDto Application data
   * @returns Created application
   */
  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    // Check if candidate has already applied to this job offer
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        jobOfferId: createApplicationDto.jobOfferId,
        candidateId: createApplicationDto.candidateId
      }
    });

    if (existingApplication) {
      throw new ConflictException('Vous avez déjà postulé à cette offre');
    }

    const application = this.applicationRepository.create({
      ...createApplicationDto,
      status: ApplicationStatus.SUBMITTED,
      lastStatusUpdate: new Date(),
      consentToShare: createApplicationDto.consentToShare ?? true,
      consentToFollow: createApplicationDto.consentToFollow ?? true,
      needsAccessibilitySupport: createApplicationDto.needsAccessibilitySupport ?? false,
      needsTransportSupport: createApplicationDto.needsTransportSupport ?? false,
      needsInterpreterSupport: createApplicationDto.needsInterpreterSupport ?? false,
      emailsSent: 0,
      callsMade: 0,
      isHired: false
    });

    return this.applicationRepository.save(application);
  }

  /**
   * Update application status (typically by employer)
   * @param id Application ID
   * @param updateDto Status update data
   * @returns Updated application
   */
  async updateStatus(id: string, updateDto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.findOne(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Set status-specific timestamps
    const now = new Date();
    const updateData: Partial<Application> = {
      status: updateDto.status,
      statusNotes: updateDto.statusNotes,
      employerFeedback: updateDto.employerFeedback,
      interviewLocation: updateDto.interviewLocation,
      interviewMeetingUrl: updateDto.interviewMeetingUrl,
      interviewNotes: updateDto.interviewNotes,
      interviewRating: updateDto.interviewRating,
      offeredSalary: updateDto.offeredSalary,
      contractTerms: updateDto.contractTerms,
      isHired: updateDto.isHired,
      lastStatusUpdate: now
    };

    // Handle status-specific logic
    switch (updateDto.status) {
      case ApplicationStatus.UNDER_REVIEW:
        if (!application.reviewedAt) {
          updateData.reviewedAt = now;
        }
        break;
      case ApplicationStatus.SHORTLISTED:
        if (!application.shortlistedAt) {
          updateData.shortlistedAt = now;
        }
        break;
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        if (updateDto.interviewScheduledAt) {
          updateData.interviewScheduledAt = new Date(updateDto.interviewScheduledAt);
        }
        break;
      case ApplicationStatus.INTERVIEWED:
        if (!application.interviewedAt) {
          updateData.interviewedAt = now;
        }
        break;
      case ApplicationStatus.SELECTED:
      case ApplicationStatus.REJECTED:
        if (!application.finalDecisionAt) {
          updateData.finalDecisionAt = now;
        }
        if (updateDto.status === ApplicationStatus.SELECTED && updateDto.isHired) {
          updateData.isHired = true;
          updateData.hiredDate = now;
        }
        break;
      case ApplicationStatus.WITHDRAWN:
        updateData.withdrawnAt = now;
        break;
    }

    // Convert string dates to Date objects
    if (updateDto.proposedStartDate) {
      updateData.proposedStartDate = new Date(updateDto.proposedStartDate);
    }

    // Calculate metrics
    this.calculateMetrics(application, updateData);

    await this.applicationRepository.update(id, updateData);
    const updatedApplication = await this.findOne(id);
    if (!updatedApplication) {
      throw new NotFoundException(`Failed to retrieve updated application with ID ${id}`);
    }
    return updatedApplication;
  }

  /**
   * Find all applications with filtering and pagination
   * @param queryOptions Query options for filtering
   * @returns Paginated applications
   */
  async findWithFilters(queryOptions: ApplicationQueryDto = {}): Promise<PaginatedApplicationsResponseDto> {
    const {
      jobOfferId,
      candidateId,
      supportingNgoId,
      status,
      isHired,
      needsAccessibilitySupport,
      createdAfter,
      createdBefore,
      searchText,
      skip = 0,
      take = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = queryOptions;

    const where: FindOptionsWhere<Application> = {};
    
    if (jobOfferId) where.jobOfferId = jobOfferId;
    if (candidateId) where.candidateId = candidateId;
    if (supportingNgoId) where.supportingNgoId = supportingNgoId;
    if (status) where.status = status;
    if (typeof isHired === 'boolean') where.isHired = isHired;
    if (typeof needsAccessibilitySupport === 'boolean') where.needsAccessibilitySupport = needsAccessibilitySupport;

    // Date range filtering
    if (createdAfter || createdBefore) {
      const startDate = createdAfter ? new Date(createdAfter) : new Date('1970-01-01');
      const endDate = createdBefore ? new Date(createdBefore) : new Date();
      where.createdAt = Between(startDate, endDate);
    }

    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.jobOffer', 'jobOffer')
      .leftJoinAndSelect('jobOffer.company', 'company')
      .leftJoinAndSelect('jobOffer.contractType', 'contractType')
      .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'candidateUser')
      .leftJoinAndSelect('application.supportingNgo', 'supportingNgo');

    // Apply where conditions
    Object.entries(where).forEach(([key, value]) => {
      if (key === 'createdAt' && value && typeof value === 'object' && 'from' in value && 'to' in value) {
        queryBuilder.andWhere(`application.createdAt >= :startDate AND application.createdAt <= :endDate`, {
          startDate: (value as any).from,
          endDate: (value as any).to
        });
      } else if (key !== 'createdAt') {
        queryBuilder.andWhere(`application.${key} = :${key}`, { [key]: value });
      }
    });

    // Search text filtering
    if (searchText) {
      queryBuilder.andWhere(
        '(application.coverLetter ILIKE :searchText OR application.motivationLetter ILIKE :searchText OR application.additionalNotes ILIKE :searchText)',
        { searchText: `%${searchText}%` }
      );
    }

    // Sorting
    queryBuilder.orderBy(`application.${sortBy}`, sortOrder);

    // Pagination
    queryBuilder.skip(skip).take(take);

    const [applications, total ] = await queryBuilder.getManyAndCount();

    const data = applications.map(app => new ApplicationResponseDto(app, true));

    return {
      data,
      total,
      limit: take,
      offset: skip,
      pages: Math.ceil(total / take),
      currentPage: Math.floor(skip / take) + 1
    };
  }

  /**
   * Find applications with page-based pagination
   * @param queryOptions Query options with page-based pagination
   * @returns Paged applications
   */
  async findWithPagePagination(queryOptions: ApplicationPageQueryDto): Promise<PagedApplicationsResponseDto> {
    const { page = 1, limit = 10, ...filterOptions } = queryOptions;
    const skip = (page - 1) * limit;

    const result = await this.findWithFilters({
      ...filterOptions,
      skip,
      take: limit
    });

    const totalPages = Math.ceil(result.total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: result.data,
      total: result.total,
      count: result.data.length,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage
    };
  }

  /**
   * Find one application by ID
   * @param id Application ID
   * @param includeRelations Whether to include related entities
   * @returns Application or null
   */
  async findOne(id: string, includeRelations = true): Promise<Application | null> {
    if (!includeRelations) {
      return this.applicationRepository.findOne({
        where: { id }
      });
    }

    return this.applicationRepository.findOne({
      where: { id },
      relations: [
        'jobOffer',
        'jobOffer.company',
        'jobOffer.contractType',
        'jobOffer.activitySector',
        'candidate',
        'candidate.user',
        'supportingNgo'
      ]
    });
  }

  /**
   * Find applications by job offer ID (for employers)
   * @param jobOfferId Job offer ID
   * @param queryOptions Query options
   * @returns Applications for the job offer
   */
  async findByJobOffer(jobOfferId: string, queryOptions: ApplicationQueryDto = {}): Promise<PaginatedApplicationsResponseDto> {
    return this.findWithFilters({
      ...queryOptions,
      jobOfferId
    });
  }

  /**
   * Find applications by candidate ID (for candidates)
   * @param candidateId Candidate ID
   * @param queryOptions Query options
   * @returns Applications by the candidate
   */
  async findByCandidate(candidateId: string, queryOptions: ApplicationQueryDto = {}): Promise<PaginatedApplicationsResponseDto> {
    return this.findWithFilters({
      ...queryOptions,
      candidateId
    });
  }

  /**
   * Find applications by supporting NGO ID (for NGOs)
   * @param ngoId NGO ID
   * @param queryOptions Query options
   * @returns Applications supported by the NGO
   */
  async findByNgo(ngoId: string, queryOptions: ApplicationQueryDto = {}): Promise<PaginatedApplicationsResponseDto> {
    return this.findWithFilters({
      ...queryOptions,
      supportingNgoId: ngoId
    });
  }

  /**
   * Find applications by company ID (for companies)
   * @param companyId Company ID
   * @param queryOptions Query options
   * @returns Applications for all job offers from the company
   */
  async findByCompany(companyId: string, queryOptions: ApplicationPaginationDto = {}): Promise<PagedApplicationsResponseDto> {
    const {
      page = 1,
      size = 10,
      search,
      jobOfferId: filterJobOfferId,
      status,
      isHired,
      needsAccessibilitySupport,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = queryOptions;

    // Build query with filters - need to join with job offers to filter by company
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.jobOffer', 'jobOffer')
      .leftJoinAndSelect('jobOffer.company', 'company')
      .leftJoinAndSelect('jobOffer.contractType', 'contractType')
      .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'candidateUser')
      .leftJoinAndSelect('application.supportingNgo', 'supportingNgo')
      .where('company.id = :companyId', { companyId });

    // Apply job offer filter if provided
    if (filterJobOfferId) {
      queryBuilder.andWhere('application.jobOfferId = :jobOfferId', { jobOfferId: filterJobOfferId });
    }

    // Apply standard filters
    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }
    if (typeof isHired === 'boolean') {
      queryBuilder.andWhere('application.isHired = :isHired', { isHired });
    }
    if (typeof needsAccessibilitySupport === 'boolean') {
      queryBuilder.andWhere('application.needsAccessibilitySupport = :needsAccessibilitySupport', { needsAccessibilitySupport });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(application.coverLetter ILIKE :search OR application.motivationLetter ILIKE :search OR application.additionalNotes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply date filters
    if (startDate) {
      queryBuilder.andWhere('application.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere('application.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    // Apply sorting
    queryBuilder.orderBy(`application.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * size;
    queryBuilder.skip(skip).take(size);

    // Execute query
    const [applications, total] = await queryBuilder.getManyAndCount();

    // Transform to response DTOs
    const data = applications.map(app => new ApplicationResponseDto(app, true));

    // Calculate pagination info
    const totalPages = Math.ceil(total / size);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      count: data.length,
      page,
      limit: size,
      totalPages,
      hasNextPage,
      hasPrevPage
    };
  }

  /**
   * Find applications with standardized pagination (page, size, search)
   * @param paginationOptions Pagination options
   * @param additionalFilters Additional filters to apply
   * @returns Paginated applications
   */
  async findWithStandardPagination(
    paginationOptions: ApplicationPaginationDto,
    additionalFilters: Partial<{ jobOfferId: string; candidateId: string; supportingNgoId: string }> = {}
  ): Promise<PagedApplicationsResponseDto> {
    const {
      page = 1,
      size = 10,
      search,
      jobOfferId: filterJobOfferId,
      status,
      isHired,
      needsAccessibilitySupport,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = paginationOptions;

    // Build query with filters
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.jobOffer', 'jobOffer')
      .leftJoinAndSelect('jobOffer.company', 'company')
      .leftJoinAndSelect('jobOffer.contractType', 'contractType')
      .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('candidate.user', 'candidateUser')
      .leftJoinAndSelect('application.supportingNgo', 'supportingNgo');

    // Apply additional filters (jobOfferId, candidateId, supportingNgoId)
    const jobOfferIdToFilter = additionalFilters.jobOfferId || filterJobOfferId;
    if (jobOfferIdToFilter) {
      queryBuilder.andWhere('application.jobOfferId = :jobOfferId', { jobOfferId: jobOfferIdToFilter });
    }
    if (additionalFilters.candidateId) {
      queryBuilder.andWhere('application.candidateId = :candidateId', { candidateId: additionalFilters.candidateId });
    }
    if (additionalFilters.supportingNgoId) {
      queryBuilder.andWhere('application.supportingNgoId = :supportingNgoId', { supportingNgoId: additionalFilters.supportingNgoId });
    }

    // Apply standard filters
    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }
    if (typeof isHired === 'boolean') {
      queryBuilder.andWhere('application.isHired = :isHired', { isHired });
    }
    if (typeof needsAccessibilitySupport === 'boolean') {
      queryBuilder.andWhere('application.needsAccessibilitySupport = :needsAccessibilitySupport', { needsAccessibilitySupport });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(application.coverLetter ILIKE :search OR application.motivationLetter ILIKE :search OR application.additionalNotes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply date filters
    if (startDate) {
      queryBuilder.andWhere('application.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere('application.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    // Apply sorting
    queryBuilder.orderBy(`application.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * size;
    queryBuilder.skip(skip).take(size);

    // Execute query
    const [applications, total] = await queryBuilder.getManyAndCount();

    // Transform to response DTOs
    const data = applications.map(app => new ApplicationResponseDto(app, true));

    // Calculate pagination info
    const totalPages = Math.ceil(total / size);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      count: data.length,
      page,
      limit: size,
      totalPages,
      hasNextPage,
      hasPrevPage
    };
  }

  /**
   * Withdraw an application (by candidate or NGO)
   * @param id Application ID
   * @param userId User ID (candidate or NGO)
   * @returns Updated application
   */
  async withdraw(id: string, userId: string): Promise<Application> {
    const application = await this.findOne(id, false);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Check if user has permission to withdraw
    if (application.candidateId !== userId && application.supportingNgoId !== userId) {
      throw new ForbiddenException('You do not have permission to withdraw this application');
    }

    // Cannot withdraw if already processed
    if (['selected', 'rejected', 'withdrawn'].includes(application.status)) {
      throw new BadRequestException('Cannot withdraw application that has already been processed');
    }

    return this.updateStatus(id, {
      status: ApplicationStatus.WITHDRAWN
    });
  }

  /**
   * Add feedback to an application
   * @param id Application ID
   * @param feedback Feedback text
   * @param feedbackType Type of feedback (employer, candidate, ngo)
   * @returns Updated application
   */
  async addFeedback(id: string, feedback: string, feedbackType: 'employer' | 'candidate' | 'ngo'): Promise<Application> {
    const application = await this.findOne(id, false);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const updateData: Partial<Application> = {};
    switch (feedbackType) {
      case 'employer':
        updateData.employerFeedback = feedback;
        break;
      case 'candidate':
        updateData.candidateFeedback = feedback;
        break;
      case 'ngo':
        updateData.ngoFeedback = feedback;
        break;
    }

    await this.applicationRepository.update(id, updateData);
    const updatedApplication = await this.findOne(id);
    if (!updatedApplication) {
      throw new NotFoundException(`Failed to retrieve updated application with ID ${id}`);
    }
    return updatedApplication;
  }

  /**
   * Get application statistics
   * @param filters Optional filters
   * @returns Statistics object
   */
  async getStatistics(filters: Partial<ApplicationQueryDto> = {}) {
    const baseQuery = this.applicationRepository.createQueryBuilder('application');

    // Apply filters
    if (filters.jobOfferId) {
      baseQuery.andWhere('application.jobOfferId = :jobOfferId', { jobOfferId: filters.jobOfferId });
    }
    if (filters.candidateId) {
      baseQuery.andWhere('application.candidateId = :candidateId', { candidateId: filters.candidateId });
    }
    if (filters.supportingNgoId) {
      baseQuery.andWhere('application.supportingNgoId = :supportingNgoId', { supportingNgoId: filters.supportingNgoId });
    }

    const [
      total,
      submitted,
      underReview,
      shortlisted,
      interviewed,
      selected,
      rejected,
      withdrawn,
      hired
    ] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'submitted' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'under_review' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'shortlisted' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'interviewed' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'selected' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'rejected' }).getCount(),
      baseQuery.clone().andWhere('application.status = :status', { status: 'withdrawn' }).getCount(),
      baseQuery.clone().andWhere('application.isHired = :isHired', { isHired: true }).getCount()
    ]);

    return {
      total,
      byStatus: {
        submitted,
        underReview,
        shortlisted,
        interviewed,
        selected,
        rejected,
        withdrawn
      },
      hired,
      conversionRate: total > 0 ? ((hired / total) * 100).toFixed(2) : 0
    };
  }

  /**
   * Calculate application metrics (days to response, days to decision)
   * @param application Original application
   * @param updateData Update data
   */
  private calculateMetrics(application: Application, updateData: Partial<Application>): void {
    const createdAt = application.createdAt;
    const now = new Date();

    // Calculate days to response (first status change)
    if (!application.daysToResponse && application.status === 'submitted') {
      const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      updateData.daysToResponse = daysDiff;
    }

    // Calculate days to decision (final decision)
    if (!application.daysToDecision && updateData.status && ['selected', 'rejected'].includes(updateData.status)) {
      const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      updateData.daysToDecision = daysDiff;
    }
  }
} 