import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CandidatePageQueryDto, CreateCandidateDto, UpdateCandidateDto } from './candidates.dto';

/**
 * Service for managing candidate profiles and operations
 * Handles CRUD operations, profile completion calculation, and advanced filtering
 */
@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Retrieve all active candidates with their related entities
   * @returns Promise<Candidate[]> Array of active candidates
   */
  async findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({
      where: { isActive: true },
      relations: [
        'user',
        'disabilityType',
        'educationLevel',
        'experienceLevel',
        'profession',
        'location'
      ],
      order: {
        profileCompletionPercentage: 'DESC',
        createdAt: 'DESC'
      }
    });
  }

  /**
   * Find candidates with advanced pagination, filtering, and search capabilities
   * @param queryOptions - Query parameters for filtering and pagination
   * @returns Promise with paginated results and metadata
   */
  async findWithPagination(queryOptions: CandidatePageQueryDto) {
    const {
      page = 1,
      size = 10,
      search,
      isActive = true,
      isProfileComplete,
      isAvailable,
      disabilityTypeId,
      handicap,
      educationLevelId,
      experienceLevelId,
      locationId
    } = queryOptions;
    

    
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (size < 1 || size > 100) {
      throw new BadRequestException('Page size must be between 1 and 100');
    }
    
    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.user', 'user')
      .leftJoinAndSelect('candidate.disabilityType', 'disabilityType')
      .leftJoinAndSelect('candidate.educationLevel', 'educationLevel')
      .leftJoinAndSelect('candidate.experienceLevel', 'experienceLevel')
      .leftJoinAndSelect('candidate.profession', 'profession')
      .leftJoinAndSelect('candidate.location', 'location');
    
    // Apply active filter
    queryBuilder.where('candidate.isActive = :isActive', { isActive });
    
    // Apply search filter across multiple fields
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(candidate.professionalSummary) LIKE LOWER(:search) OR LOWER(candidate.skills) LIKE LOWER(:search) OR LOWER(candidate.biography) LIKE LOWER(:search))',
        { search: searchTerm }
      );
    }
    
    // Apply profile completion filter
    if (isProfileComplete !== undefined) {
      queryBuilder.andWhere('candidate.isProfileComplete = :isProfileComplete', { isProfileComplete });
    }
    
    // Apply availability filter
    if (isAvailable !== undefined) {
      queryBuilder.andWhere('candidate.isAvailable = :isAvailable', { isAvailable });
    }
    
    // Apply disability type filter
    if (disabilityTypeId) {
      queryBuilder.andWhere('candidate.disabilityTypeId = :disabilityTypeId', { disabilityTypeId });
    }
    
    // Apply handicap filter (alternative disability type filter)
    if (handicap) {
      queryBuilder.andWhere('candidate.disabilityTypeId = :handicap', { handicap });
    }
    
    // Apply education level filter
    if (educationLevelId) {
      queryBuilder.andWhere('candidate.educationLevelId = :educationLevelId', { educationLevelId });
    }
    
    // Apply experience level filter
    if (experienceLevelId) {
      queryBuilder.andWhere('candidate.experienceLevelId = :experienceLevelId', { experienceLevelId });
    }
    
    // Apply profession filter
    if (queryOptions.professionId) {
      queryBuilder.andWhere('candidate.professionId = :professionId', { professionId: queryOptions.professionId });
    }
    
    // Apply location filter
    if (locationId) {
      queryBuilder.andWhere('candidate.locationId = :locationId', { locationId });
    }
    
    
    // Apply sorting - prioritize profile completion and recency
    queryBuilder.orderBy('candidate.profileCompletionPercentage', 'DESC')
                .addOrderBy('candidate.createdAt', 'DESC');
    
    // Apply pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    
    return {
      data,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
        hasNextPage: page < Math.ceil(total / size),
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Find a candidate by their unique identifier
   * @param id - Candidate UUID
   * @returns Promise<Candidate> The candidate with all related data
   * @throws NotFoundException if candidate not found
   */
  async findOne(id: string): Promise<Candidate> {
    if (!id) {
      throw new BadRequestException('Candidate ID is required');
    }

    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: [
        'user',
        'disabilityType',
        'educationLevel',
        'experienceLevel',
        'profession',
        'location'
      ],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  /**
   * Find a candidate by their associated user ID
   * @param userId - User UUID
   * @returns Promise<Candidate> The candidate profile
   * @throws NotFoundException if candidate not found
   */
  async findByUserId(userId: string): Promise<Candidate> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const candidate = await this.candidateRepository.findOne({
      where: { userId },
      relations: [
        'user',
        'disabilityType',
        'educationLevel',
        'experienceLevel',
        'profession',
        'location'
      ],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate profile not found for user ID ${userId}`);
    }

    return candidate;
  }

  /**
   * Create a new candidate profile
   * @param createData - Candidate creation data
   * @returns Promise<Candidate> The created candidate
   * @throws BadRequestException if validation fails
   */
  async create(createData: CreateCandidateDto & { userId: string }): Promise<Candidate> {
    // Check if candidate already exists for this user
    const existingCandidate = await this.candidateRepository.findOne({
      where: { userId: createData.userId }
    });

    if (existingCandidate) {
      throw new BadRequestException('Candidate profile already exists for this user');
    }

    // Validate required fields
    if (!createData.disabilityTypeId) {
      throw new BadRequestException('Disability type is required');
    }

    try {
      const candidate = this.candidateRepository.create(createData);
      return await this.candidateRepository.save(candidate);
    } catch (error) {
      throw new BadRequestException('Failed to create candidate profile: ' + error.message);
    }
  }

  /**
   * Update an existing candidate profile
   * @param id - Candidate UUID
   * @param updateData - Partial candidate data to update
   * @returns Promise<Candidate> The updated candidate
   * @throws NotFoundException if candidate not found
   */
  async update(id: string, updateData: UpdateCandidateDto): Promise<Candidate> {
    await this.findOne(id); // Validates existence

    try {
      await this.candidateRepository.update(id, updateData);
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Failed to update candidate profile: ' + error.message);
    }
  }

  /**
   * Soft delete a candidate profile by setting isActive to false
   * @param id - Candidate UUID
   * @throws NotFoundException if candidate not found
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Validates existence
    
    try {
      await this.candidateRepository.update(id, { isActive: false });
    } catch (error) {
      throw new BadRequestException('Failed to deactivate candidate profile: ' + error.message);
    }
  }

  /**
   * Calculate and update profile completion percentage
   * Profile completion is based on:
   * - Basic info (disability type, education, experience, location): 4 fields = 33%
   * - Professional info (summary, skills, languages, CV): 4 fields = 33%
   * - Additional info (biography, photo, video, salary): 4 fields = 34%
   * 
   * @param id - Candidate UUID
   * @throws NotFoundException if candidate not found
   */
  async updateProfileCompletion(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    
    let completionScore = 0;
    const totalFields = 12; // Total number of important fields

    // Basic information (4 points - 33%)
    if (candidate.disabilityTypeId) completionScore++;
    if (candidate.educationLevelId) completionScore++;
    if (candidate.experienceLevelId) completionScore++;
    if (candidate.locationId) completionScore++;

    // Professional information (4 points - 33%)
    if (candidate.professionalSummary && candidate.professionalSummary.trim()) completionScore++;
    if (candidate.skills && candidate.skills.trim()) completionScore++;
    if (candidate.languages && candidate.languages.trim()) completionScore++;
    if (candidate.cvFileUrl && candidate.cvFileUrl.trim()) completionScore++;

    // Additional information (4 points - 34%)
    if (candidate.biography && candidate.biography.trim()) completionScore++;
    if (candidate.photoUrl && candidate.photoUrl.trim()) completionScore++;
    if (candidate.videoPresentation && candidate.videoPresentation.trim()) completionScore++;
    if (candidate.expectedSalaryMin && candidate.expectedSalaryMin > 0) completionScore++;

    const percentage = Math.round((completionScore / totalFields) * 100);
    const isComplete = percentage >= 80; // Profile is complete at 80% or higher

    try {
      await this.candidateRepository.update(id, {
        profileCompletionPercentage: percentage,
        isProfileComplete: isComplete,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update profile completion: ' + error.message);
    }
  }

  /**
   * Get candidate statistics for dashboard/analytics
   * @returns Promise with various candidate metrics
   */
  async getCandidateStats() {
    const [
      totalCandidates,
      activeCandidates,
      completedProfiles,
      availableCandidates,
      candidatesWithCv,
      candidatesWithVideo,
      avgCompletion
    ] = await Promise.all([
      this.candidateRepository.count(),
      this.candidateRepository.count({ where: { isActive: true } }),
      this.candidateRepository.count({ where: { isProfileComplete: true, isActive: true } }),
      this.candidateRepository.count({ where: { isAvailable: true, isActive: true } }),
      this.candidateRepository.createQueryBuilder('candidate')
        .where('candidate.isActive = true')
        .andWhere('candidate.cvFileUrl IS NOT NULL')
        .andWhere('candidate.cvFileUrl != \'\'')
        .getCount(),
      this.candidateRepository.createQueryBuilder('candidate')
        .where('candidate.isActive = true')
        .andWhere('candidate.videoPresentation IS NOT NULL')
        .andWhere('candidate.videoPresentation != \'\'')
        .getCount(),
      this.candidateRepository.createQueryBuilder('candidate')
        .select('AVG(candidate.profileCompletionPercentage)', 'avg')
        .where('candidate.isActive = true')
        .getRawOne()
    ]);

    return {
      totalCandidates,
      activeCandidates,
      completedProfiles,
      availableCandidates,
      candidatesWithCv,
      candidatesWithVideo,
      averageCompletionRate: parseFloat(avgCompletion?.avg || '0')
    };
  }
} 