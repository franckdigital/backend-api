import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, In } from 'typeorm';
import { JobOffer } from '../entities/job-offer.entity';
import { Company } from '../entities/company.entity';
import { DisabilityType } from '../entities/disability-type.entity';
import { JobOfferPageQueryDto, CreateJobOfferDto, UpdateJobOfferDto } from './job-offers.dto';
import dayjs from 'dayjs';

export interface JobSearchFilters {
    title?: string;
    activitySectorId?: string;
    contractTypeId?: string;
    locationId?: string;
    isRemoteWork?: boolean;
    isDisabilityFriendly?: boolean;
    isExclusiveForDisabled?: boolean;
    disabilityTypeIds?: string[];
    salaryMin?: number;
    salaryMax?: number;
    experienceLevelId?: string;
    educationLevelId?: string;
}

@Injectable()
export class JobOffersService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(DisabilityType)
        private readonly disabilityTypeRepository: Repository<DisabilityType>,
    ) { }

    async findAll(): Promise<JobOffer[]> {
        return this.jobOfferRepository.find({
            where: {
                isActive: true,
                status: 'published'
            },
            relations: [
                'company',
                'company.user',
                'activitySector',
                'contractType',
                'location',
                'minimumEducationLevel',
                'minimumExperienceLevel',
                'suitableDisabilityTypes'
            ],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Find job offers with pagination and search
     */
    async findWithPagination(queryOptions: JobOfferPageQueryDto) {
        const {
            page = 1,
            size = 10,
            search,
            isActive = true,
            isVisible,
            status,
            companyId,
            activitySectorId,
            contractTypeId,
            locationId,
            minimumEducationLevelId,
            minimumExperienceLevelId,
            isRemoteWork,
            isDisabilityFriendly,
            isExclusiveForDisabled,
            salaryMin,
            salaryMax,
            suitableDisabilityTypeIds
        } = queryOptions;
        
        const queryBuilder = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('company.user', 'companyUser')
            .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
            .leftJoinAndSelect('jobOffer.contractType', 'contractType')
            .leftJoinAndSelect('jobOffer.location', 'location')
            .leftJoinAndSelect('jobOffer.minimumEducationLevel', 'minimumEducationLevel')
            .leftJoinAndSelect('jobOffer.minimumExperienceLevel', 'minimumExperienceLevel')
            .leftJoinAndSelect('jobOffer.suitableDisabilityTypes', 'suitableDisabilityTypes');
        
        // Apply active filter and company verification
        queryBuilder.where('jobOffer.isActive = :isActive', { isActive });
        
        // Only show job offers from verified companies that can post job offers
        queryBuilder.andWhere('company.isVerified = :isVerified', { isVerified: true });
        queryBuilder.andWhere('company.canPostJobOffers = :canPostJobOffers', { canPostJobOffers: true });
        queryBuilder.andWhere('company.isActive = :companyIsActive', { companyIsActive: true });
        
        // Apply search filter
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(jobOffer.title) LIKE LOWER(:search) OR LOWER(jobOffer.description) LIKE LOWER(:search) OR LOWER(jobOffer.requirements) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }
        
        // Apply visibility filter
        if (isVisible !== undefined) {
            queryBuilder.andWhere('jobOffer.isVisible = :isVisible', { isVisible });
        }
        
        // Apply status filter
        if (status) {
            queryBuilder.andWhere('jobOffer.status = :status', { status });
        }
        
        // Apply company filter
        if (companyId) {
            queryBuilder.andWhere('jobOffer.companyId = :companyId', { companyId });
        }
        
        // Apply activity sector filter
        if (activitySectorId) {
            queryBuilder.andWhere('jobOffer.activitySectorId = :activitySectorId', { activitySectorId });
        }
        
        // Apply contract type filter
        if (contractTypeId) {
            queryBuilder.andWhere('jobOffer.contractTypeId = :contractTypeId', { contractTypeId });
        }
        
        // Apply location filter
        if (locationId) {
            queryBuilder.andWhere('jobOffer.locationId = :locationId', { locationId });
        }
        
        // Apply minimum education level filter
        if (minimumEducationLevelId) {
            queryBuilder.andWhere('jobOffer.minimumEducationLevelId = :minimumEducationLevelId', { minimumEducationLevelId });
        }
        
        // Apply minimum experience level filter
        if (minimumExperienceLevelId) {
            queryBuilder.andWhere('jobOffer.minimumExperienceLevelId = :minimumExperienceLevelId', { minimumExperienceLevelId });
        }
        
        // Apply remote work filter
        if (isRemoteWork !== undefined) {
            queryBuilder.andWhere('jobOffer.isRemoteWork = :isRemoteWork', { isRemoteWork });
        }
        
        // Apply disability friendly filter
        if (isDisabilityFriendly !== undefined) {
            queryBuilder.andWhere('jobOffer.isDisabilityFriendly = :isDisabilityFriendly', { isDisabilityFriendly });
        }
        
        // Apply exclusive for disabled filter
        if (isExclusiveForDisabled !== undefined) {
            queryBuilder.andWhere('jobOffer.isExclusiveForDisabled = :isExclusiveForDisabled', { isExclusiveForDisabled });
        }
        
        // Apply salary filters
        if (salaryMin !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMin IS NOT NULL AND jobOffer.salaryMin >= :salaryMin)', { salaryMin });
        }
        if (salaryMax !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMax IS NOT NULL AND jobOffer.salaryMax <= :salaryMax)', { salaryMax });
        }

        // Apply disability types filter
        if (suitableDisabilityTypeIds && suitableDisabilityTypeIds.length > 0) {
            queryBuilder.andWhere('suitableDisabilityTypes.id IN (:...suitableDisabilityTypeIds)', { suitableDisabilityTypeIds });
        }
        
        // Apply sorting
        queryBuilder.orderBy('jobOffer.publishedAt', 'DESC')
                    .addOrderBy('jobOffer.createdAt', 'DESC');
        
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
                totalPages: Math.ceil(total / size)
            }
        };
    }

    async findPublishedOffers(): Promise<JobOffer[]> {
        return this.jobOfferRepository.find({
            where: {
                isActive: true,
                isVisible: true,
                status: 'published',
                company: {
                    isVerified: true,
                    canPostJobOffers: true,
                    isActive: true
                }
            },
            relations: [
                'company',
                'company.user',
                'activitySector',
                'contractType',
                'location',
                'minimumEducationLevel',
                'minimumExperienceLevel',
                'suitableDisabilityTypes'
            ],
            order: { publishedAt: 'DESC' },
        });
    }

    async searchJobOffers(filters: JobSearchFilters): Promise<JobOffer[]> {
        const queryBuilder = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('company.user', 'companyUser')
            .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
            .leftJoinAndSelect('jobOffer.contractType', 'contractType')
            .leftJoinAndSelect('jobOffer.location', 'location')
            .leftJoinAndSelect('jobOffer.minimumEducationLevel', 'minimumEducationLevel')
            .leftJoinAndSelect('jobOffer.minimumExperienceLevel', 'minimumExperienceLevel')
            .leftJoinAndSelect('jobOffer.suitableDisabilityTypes', 'suitableDisabilityTypes');

        // Base conditions for published offers from verified companies
        queryBuilder.where('jobOffer.isActive = :isActive', { isActive: true });
        queryBuilder.andWhere('jobOffer.isVisible = :isVisible', { isVisible: true });
        queryBuilder.andWhere('jobOffer.status = :status', { status: 'published' });
        queryBuilder.andWhere('company.isVerified = :isVerified', { isVerified: true });
        queryBuilder.andWhere('company.canPostJobOffers = :canPostJobOffers', { canPostJobOffers: true });
        queryBuilder.andWhere('company.isActive = :companyIsActive', { companyIsActive: true });

        // Apply filters
        if (filters.title) {
            queryBuilder.andWhere('LOWER(jobOffer.title) LIKE LOWER(:title)', { title: `%${filters.title}%` });
        }

        if (filters.activitySectorId) {
            queryBuilder.andWhere('jobOffer.activitySectorId = :activitySectorId', { activitySectorId: filters.activitySectorId });
        }

        if (filters.contractTypeId) {
            queryBuilder.andWhere('jobOffer.contractTypeId = :contractTypeId', { contractTypeId: filters.contractTypeId });
        }

        if (filters.locationId) {
            queryBuilder.andWhere('jobOffer.locationId = :locationId', { locationId: filters.locationId });
        }

        if (filters.isRemoteWork !== undefined) {
            queryBuilder.andWhere('jobOffer.isRemoteWork = :isRemoteWork', { isRemoteWork: filters.isRemoteWork });
        }

        if (filters.isDisabilityFriendly !== undefined) {
            queryBuilder.andWhere('jobOffer.isDisabilityFriendly = :isDisabilityFriendly', { isDisabilityFriendly: filters.isDisabilityFriendly });
        }

        if (filters.isExclusiveForDisabled !== undefined) {
            queryBuilder.andWhere('jobOffer.isExclusiveForDisabled = :isExclusiveForDisabled', { isExclusiveForDisabled: filters.isExclusiveForDisabled });
        }

        if (filters.experienceLevelId) {
            queryBuilder.andWhere('jobOffer.minimumExperienceLevelId = :experienceLevelId', { experienceLevelId: filters.experienceLevelId });
        }

        if (filters.educationLevelId) {
            queryBuilder.andWhere('jobOffer.minimumEducationLevelId = :educationLevelId', { educationLevelId: filters.educationLevelId });
        }

        // Disability types filter - filter by jobs that are suitable for specific disability types
        if (filters.disabilityTypeIds && filters.disabilityTypeIds.length > 0) {
            queryBuilder.andWhere('suitableDisabilityTypes.id IN (:...disabilityTypeIds)', { disabilityTypeIds: filters.disabilityTypeIds });
        }

        // Salary range filter
        if (filters.salaryMin !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMin IS NOT NULL AND jobOffer.salaryMin >= :salaryMin)', { salaryMin: filters.salaryMin });
        }
        if (filters.salaryMax !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMax IS NOT NULL AND jobOffer.salaryMax <= :salaryMax)', { salaryMax: filters.salaryMax });
        }

        queryBuilder.orderBy('jobOffer.publishedAt', 'DESC');

        return queryBuilder.getMany();
    }

    async findByCompany(companyId: string): Promise<JobOffer[]> {
        return this.jobOfferRepository.find({
            where: {
                companyId,
                isActive: true
            },
            relations: [
                'company',
                'activitySector',
                'contractType',
                'location',
                'minimumEducationLevel',
                'minimumExperienceLevel',
                'suitableDisabilityTypes'
            ],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<JobOffer> {
        const jobOffer = await this.jobOfferRepository.findOne({
            where: { id },
            relations: [
                'company',
                'company.user',
                'activitySector',
                'contractType',
                'location',
                'minimumEducationLevel',
                'minimumExperienceLevel',
                'suitableDisabilityTypes'
            ],
        });

        if (!jobOffer) {
            throw new NotFoundException(`Job offer with ID ${id} not found`);
        }

        return jobOffer;
    }

    async create(createData: CreateJobOfferDto, companyId: string): Promise<JobOffer> {
        // Verify company is verified and can post job offers
        await this.verifyCompanyCanPostJobOffers(companyId);
        
        const { suitableDisabilityTypeIds, ...jobOfferData } = createData;
        const jobOfferWithCompany = { ...jobOfferData, companyId };

        // Formater la date applicationDeadline si présente
        if (jobOfferWithCompany.applicationDeadline) {
            // Si c'est un objet Date ou une string, on la convertit en YYYY-MM-DD
            const date = new Date(jobOfferWithCompany.applicationDeadline);
            if (!isNaN(date.getTime())) {
                // Format YYYY-MM-DD
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                // On crée un nouvel objet Date à partir de la string formatée
                jobOfferWithCompany.applicationDeadline = new Date(`${yyyy}-${mm}-${dd}`);
            }
        }

        const jobOffer = this.jobOfferRepository.create(jobOfferWithCompany);
        
        // Handle disability types relationship
        if (suitableDisabilityTypeIds && suitableDisabilityTypeIds.length > 0) {
            const disabilityTypes = await this.disabilityTypeRepository.find({
                where: { id: In(suitableDisabilityTypeIds), isActive: true }
            });
            jobOffer.suitableDisabilityTypes = disabilityTypes;
        }

        return this.jobOfferRepository.save(jobOffer);
    }

    async update(id: string, updateData: UpdateJobOfferDto, companyId?: string): Promise<JobOffer> {
        const jobOffer = await this.findOne(id);

        // Check if user owns this job offer
        if (companyId && jobOffer.companyId !== companyId) {
            throw new ForbiddenException('You can only update your own job offers');
        }

        const { suitableDisabilityTypeIds, ...jobOfferUpdateData } = updateData;

        // Update basic job offer data
        await this.jobOfferRepository.update(id, jobOfferUpdateData);

        // Handle disability types relationship if provided
        if (suitableDisabilityTypeIds !== undefined) {
            const updatedJobOffer = await this.jobOfferRepository.findOne({
                where: { id },
                relations: ['suitableDisabilityTypes']
            });

            if (!updatedJobOffer) {
                throw new NotFoundException(`Job offer with id ${id} not found`);
            }

            if (suitableDisabilityTypeIds.length > 0) {
                const disabilityTypes = await this.disabilityTypeRepository.find({
                    where: { id: In(suitableDisabilityTypeIds), isActive: true }
                });
                updatedJobOffer.suitableDisabilityTypes = disabilityTypes;
            } else {
                updatedJobOffer.suitableDisabilityTypes = [];
            }

            await this.jobOfferRepository.save(updatedJobOffer);
        }

        return this.findOne(id);
    }

    async publish(id: string, companyId?: string): Promise<JobOffer> {
        const jobOffer = await this.findOne(id);

        if (companyId && jobOffer.companyId !== companyId) {
            throw new ForbiddenException('You can only publish your own job offers');
        }

        // Verify company is verified and can post job offers
        await this.verifyCompanyCanPostJobOffers(jobOffer.companyId);

        await this.jobOfferRepository.update(id, {
            status: 'published',
            isVisible: true,
            publishedAt: new Date(),
        });

        return this.findOne(id);
    }

    async pause(id: string, companyId?: string): Promise<JobOffer> {
        const jobOffer = await this.findOne(id);

        if (companyId && jobOffer.companyId !== companyId) {
            throw new ForbiddenException('You can only pause your own job offers');
        }

        await this.jobOfferRepository.update(id, {
            status: 'paused',
            isVisible: false,
        });

        return this.findOne(id);
    }

    async close(id: string, companyId?: string): Promise<JobOffer> {
        const jobOffer = await this.findOne(id);

        if (companyId && jobOffer.companyId !== companyId) {
            throw new ForbiddenException('You can only close your own job offers');
        }

        await this.jobOfferRepository.update(id, {
            status: 'closed',
            isVisible: false,
            closedAt: new Date(),
        });

        return this.findOne(id);
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.jobOfferRepository.increment({ id }, 'viewCount', 1);
    }

    async incrementApplicationCount(id: string): Promise<void> {
        await this.jobOfferRepository.increment({ id }, 'applicationCount', 1);
    }

    async remove(id: string, companyId?: string): Promise<void> {
        const jobOffer = await this.findOne(id);

        if (companyId && jobOffer.companyId !== companyId) {
            throw new ForbiddenException('You can only delete your own job offers');
        }

        await this.jobOfferRepository.update(id, { isActive: false });
    }

    /**
     * Verify that a company is verified and can post job offers
     */
    private async verifyCompanyCanPostJobOffers(companyId: string): Promise<void> {
        const company = await this.companyRepository.findOne({
            where: { id: companyId },
            select: ['isVerified', 'canPostJobOffers', 'isActive', 'companyName']
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        if (!company.isActive) {
            throw new ForbiddenException('Company account is inactive');
        }

        if (!company.isVerified) {
            throw new ForbiddenException('Company must be verified by administrators before posting job offers');
        }

        if (!company.canPostJobOffers) {
            throw new ForbiddenException('Company is not authorized to post job offers');
        }
    }

    async getJobOfferStats(id: string): Promise<any> {
        const jobOffer = await this.findOne(id);

        return {
            id: jobOffer.id,
            title: jobOffer.title,
            viewCount: jobOffer.viewCount,
            applicationCount: jobOffer.applicationCount,
            shortlistedCount: jobOffer.shortlistedCount,
            hiredCount: jobOffer.hiredCount,
            status: jobOffer.status,
            publishedAt: jobOffer.publishedAt,
            closedAt: jobOffer.closedAt,
        };
    }

    /**
     * Find job offers for a specific company with pagination (for company dashboard)
     * This method doesn't apply company verification filters since companies should see all their offers
     */
    async findMyOffersWithPagination(queryOptions: JobOfferPageQueryDto, companyId: string) {
        const {
            page = 1,
            size = 10,
            search,
            isActive,
            isVisible,
            status,
            activitySectorId,
            contractTypeId,
            locationId,
            minimumEducationLevelId,
            minimumExperienceLevelId,
            isRemoteWork,
            isDisabilityFriendly,
            isExclusiveForDisabled,
            salaryMin,
            salaryMax
        } = queryOptions;
        
        const queryBuilder = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('company.user', 'companyUser')
            .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
            .leftJoinAndSelect('jobOffer.contractType', 'contractType')
            .leftJoinAndSelect('jobOffer.location', 'location')
            .leftJoinAndSelect('jobOffer.minimumEducationLevel', 'minimumEducationLevel')
            .leftJoinAndSelect('jobOffer.minimumExperienceLevel', 'minimumExperienceLevel')
            .leftJoinAndSelect('jobOffer.suitableDisabilityTypes', 'suitableDisabilityTypes');
        
        // Apply company filter first - this is the primary filter
        queryBuilder.where('jobOffer.companyId = :companyId', { companyId });
        
        // Apply active filter ONLY if explicitly provided
        if (isActive !== undefined) {
            queryBuilder.andWhere('jobOffer.isActive = :isActive', { isActive });
        }
        
        // Apply search filter
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(jobOffer.title) LIKE LOWER(:search) OR LOWER(jobOffer.description) LIKE LOWER(:search) OR LOWER(jobOffer.requirements) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }
        
        // Apply visibility filter
        if (isVisible !== undefined) {
            queryBuilder.andWhere('jobOffer.isVisible = :isVisible', { isVisible });
        }
        
        // Apply status filter
        if (status) {
            queryBuilder.andWhere('jobOffer.status = :status', { status });
        }
        
        // Apply activity sector filter
        if (activitySectorId) {
            queryBuilder.andWhere('jobOffer.activitySectorId = :activitySectorId', { activitySectorId });
        }
        
        // Apply contract type filter
        if (contractTypeId) {
            queryBuilder.andWhere('jobOffer.contractTypeId = :contractTypeId', { contractTypeId });
        }
        
        // Apply location filter
        if (locationId) {
            queryBuilder.andWhere('jobOffer.locationId = :locationId', { locationId });
        }
        
        // Apply minimum education level filter
        if (minimumEducationLevelId) {
            queryBuilder.andWhere('jobOffer.minimumEducationLevelId = :minimumEducationLevelId', { minimumEducationLevelId });
        }
        
        // Apply minimum experience level filter
        if (minimumExperienceLevelId) {
            queryBuilder.andWhere('jobOffer.minimumExperienceLevelId = :minimumExperienceLevelId', { minimumExperienceLevelId });
        }
        
        // Apply remote work filter
        if (isRemoteWork !== undefined) {
            queryBuilder.andWhere('jobOffer.isRemoteWork = :isRemoteWork', { isRemoteWork });
        }
        
        // Apply disability friendly filter
        if (isDisabilityFriendly !== undefined) {
            queryBuilder.andWhere('jobOffer.isDisabilityFriendly = :isDisabilityFriendly', { isDisabilityFriendly });
        }
        
        // Apply exclusive for disabled filter
        if (isExclusiveForDisabled !== undefined) {
            queryBuilder.andWhere('jobOffer.isExclusiveForDisabled = :isExclusiveForDisabled', { isExclusiveForDisabled });
        }
        
        // Apply salary filters
        if (salaryMin !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMin IS NOT NULL AND jobOffer.salaryMin >= :salaryMin)', { salaryMin });
        }
        if (salaryMax !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMax IS NOT NULL AND jobOffer.salaryMax <= :salaryMax)', { salaryMax });
        }
        
        // Apply sorting - show most recent first
        queryBuilder.orderBy('jobOffer.createdAt', 'DESC')
                    .addOrderBy('jobOffer.publishedAt', 'DESC');
        
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
                totalPages: Math.ceil(total / size)
            }
        };
    }

    /**
     * Find all job offers for a specific company without pagination (for company dashboard)
     * This method doesn't apply company verification filters since companies should see all their offers
     */
    async findMyOffers(queryOptions: Partial<JobOfferPageQueryDto>, companyId: string): Promise<JobOffer[]> {
        const {
            search,
            isActive,
            isVisible,
            status,
            activitySectorId,
            contractTypeId,
            locationId,
            minimumEducationLevelId,
            minimumExperienceLevelId,
            isRemoteWork,
            isDisabilityFriendly,
            isExclusiveForDisabled,
            salaryMin,
            salaryMax
        } = queryOptions;
        
        const queryBuilder = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('company.user', 'companyUser')
            .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
            .leftJoinAndSelect('jobOffer.contractType', 'contractType')
            .leftJoinAndSelect('jobOffer.location', 'location')
            .leftJoinAndSelect('jobOffer.minimumEducationLevel', 'minimumEducationLevel')
            .leftJoinAndSelect('jobOffer.minimumExperienceLevel', 'minimumExperienceLevel')
            .leftJoinAndSelect('jobOffer.suitableDisabilityTypes', 'suitableDisabilityTypes');
        
        // Apply company filter first - this is the primary filter
        queryBuilder.where('jobOffer.companyId = :companyId', { companyId });
        
        // Apply active filter ONLY if explicitly provided
        if (isActive !== undefined) {
            queryBuilder.andWhere('jobOffer.isActive = :isActive', { isActive });
        }
        
        // Apply search filter
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(jobOffer.title) LIKE LOWER(:search) OR LOWER(jobOffer.description) LIKE LOWER(:search) OR LOWER(jobOffer.requirements) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }
        
        // Apply visibility filter
        if (isVisible !== undefined) {
            queryBuilder.andWhere('jobOffer.isVisible = :isVisible', { isVisible });
        }
        
        // Apply status filter
        if (status) {
            queryBuilder.andWhere('jobOffer.status = :status', { status });
        }
        
        // Apply activity sector filter
        if (activitySectorId) {
            queryBuilder.andWhere('jobOffer.activitySectorId = :activitySectorId', { activitySectorId });
        }
        
        // Apply contract type filter
        if (contractTypeId) {
            queryBuilder.andWhere('jobOffer.contractTypeId = :contractTypeId', { contractTypeId });
        }
        
        // Apply location filter
        if (locationId) {
            queryBuilder.andWhere('jobOffer.locationId = :locationId', { locationId });
        }
        
        // Apply minimum education level filter
        if (minimumEducationLevelId) {
            queryBuilder.andWhere('jobOffer.minimumEducationLevelId = :minimumEducationLevelId', { minimumEducationLevelId });
        }
        
        // Apply minimum experience level filter
        if (minimumExperienceLevelId) {
            queryBuilder.andWhere('jobOffer.minimumExperienceLevelId = :minimumExperienceLevelId', { minimumExperienceLevelId });
        }
        
        // Apply remote work filter
        if (isRemoteWork !== undefined) {
            queryBuilder.andWhere('jobOffer.isRemoteWork = :isRemoteWork', { isRemoteWork });
        }
        
        // Apply disability friendly filter
        if (isDisabilityFriendly !== undefined) {
            queryBuilder.andWhere('jobOffer.isDisabilityFriendly = :isDisabilityFriendly', { isDisabilityFriendly });
        }
        
        // Apply exclusive for disabled filter
        if (isExclusiveForDisabled !== undefined) {
            queryBuilder.andWhere('jobOffer.isExclusiveForDisabled = :isExclusiveForDisabled', { isExclusiveForDisabled });
        }
        
        // Apply salary filters
        if (salaryMin !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMin IS NOT NULL AND jobOffer.salaryMin >= :salaryMin)', { salaryMin });
        }
        if (salaryMax !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMax IS NOT NULL AND jobOffer.salaryMax <= :salaryMax)', { salaryMax });
        }
        
        // Apply sorting - show most recent first
        queryBuilder.orderBy('jobOffer.createdAt', 'DESC')
                    .addOrderBy('jobOffer.publishedAt', 'DESC');
        
        // No pagination - return all matching results
        return queryBuilder.getMany();
    }

    /**
     * Find published job offers with pagination (public endpoint)
     * This method applies company verification filters to show only offers from verified companies
     */
    async findPublishedOffersWithPagination(queryOptions: any) {
        const {
            page = 1,
            size = 10,
            search,
            isActive = true,
            isVisible = true,
            status = 'published',
            activitySectorId,
            contractTypeId,
            locationId,
            minimumEducationLevelId,
            minimumExperienceLevelId,
            isRemoteWork,
            isDisabilityFriendly,
            isExclusiveForDisabled,
            salaryMin,
            salaryMax
        } = queryOptions;
        
        const queryBuilder = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('company.user', 'companyUser')
            .leftJoinAndSelect('jobOffer.activitySector', 'activitySector')
            .leftJoinAndSelect('jobOffer.contractType', 'contractType')
            .leftJoinAndSelect('jobOffer.location', 'location')
            .leftJoinAndSelect('jobOffer.minimumEducationLevel', 'minimumEducationLevel')
            .leftJoinAndSelect('jobOffer.minimumExperienceLevel', 'minimumExperienceLevel')
            .leftJoinAndSelect('jobOffer.suitableDisabilityTypes', 'suitableDisabilityTypes');
        
        // Apply base filters for published offers
        queryBuilder.where('jobOffer.isActive = :isActive', { isActive });
        queryBuilder.andWhere('jobOffer.isVisible = :isVisible', { isVisible });
        queryBuilder.andWhere('jobOffer.status = :status', { status });
        
        // Only show job offers from verified companies that can post job offers
        queryBuilder.andWhere('company.isVerified = :isVerified', { isVerified: true });
        queryBuilder.andWhere('company.canPostJobOffers = :canPostJobOffers', { canPostJobOffers: true });
        queryBuilder.andWhere('company.isActive = :companyIsActive', { companyIsActive: true });
        
        // Apply search filter
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(jobOffer.title) LIKE LOWER(:search) OR LOWER(jobOffer.description) LIKE LOWER(:search) OR LOWER(jobOffer.requirements) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }
        
        // Apply activity sector filter
        if (activitySectorId) {
            queryBuilder.andWhere('jobOffer.activitySectorId = :activitySectorId', { activitySectorId });
        }
        
        // Apply contract type filter
        if (contractTypeId) {
            queryBuilder.andWhere('jobOffer.contractTypeId = :contractTypeId', { contractTypeId });
        }
        
        // Apply location filter
        if (locationId) {
            queryBuilder.andWhere('jobOffer.locationId = :locationId', { locationId });
        }
        
        // Apply minimum education level filter
        if (minimumEducationLevelId) {
            queryBuilder.andWhere('jobOffer.minimumEducationLevelId = :minimumEducationLevelId', { minimumEducationLevelId });
        }
        
        // Apply minimum experience level filter
        if (minimumExperienceLevelId) {
            queryBuilder.andWhere('jobOffer.minimumExperienceLevelId = :minimumExperienceLevelId', { minimumExperienceLevelId });
        }
        
        // Apply remote work filter
        if (isRemoteWork !== undefined) {
            queryBuilder.andWhere('jobOffer.isRemoteWork = :isRemoteWork', { isRemoteWork });
        }
        
        // Apply disability friendly filter
        if (isDisabilityFriendly !== undefined) {
            queryBuilder.andWhere('jobOffer.isDisabilityFriendly = :isDisabilityFriendly', { isDisabilityFriendly });
        }
        
        // Apply exclusive for disabled filter
        if (isExclusiveForDisabled !== undefined) {
            queryBuilder.andWhere('jobOffer.isExclusiveForDisabled = :isExclusiveForDisabled', { isExclusiveForDisabled });
        }
        
        // Apply salary filters
        if (salaryMin !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMin IS NOT NULL AND jobOffer.salaryMin >= :salaryMin)', { salaryMin });
        }
        if (salaryMax !== undefined) {
            queryBuilder.andWhere('(jobOffer.salaryMax IS NOT NULL AND jobOffer.salaryMax <= :salaryMax)', { salaryMax });
        }
        
        // Apply sorting - show most recent published first
        queryBuilder.orderBy('jobOffer.publishedAt', 'DESC')
                    .addOrderBy('jobOffer.createdAt', 'DESC');
        
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
                totalPages: Math.ceil(total / size)
            }
        };
    }
} 