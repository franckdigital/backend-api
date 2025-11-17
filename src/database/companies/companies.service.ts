import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CompanyPageQueryDto } from './companies.dto';
import { ValidateCompanyDto, CompanyValidationResponseDto } from './dto/company-validation.dto';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
    ) { }

    async findAll(): Promise<Company[]> {
        return this.companyRepository.find({
            where: { isActive: true },
            relations: [
                'user',
                'activitySector',
                'companySize',
                'location'
            ],
        });
    }

    /**
     * Find companies with pagination and search
     */
    async findWithPagination(queryOptions: CompanyPageQueryDto) {
        const {
            page = 1,
            size = 10,
            search,
            isActive,
            isVerified,
            isCompliantWithLaw,
            isSubjectToDisabilityQuota,
            activitySectorId,
            companySizeId,
            locationId,
            minEmployeeCount,
            maxEmployeeCount
        } = queryOptions;
        
        const queryBuilder = this.companyRepository.createQueryBuilder('company')
            .leftJoinAndSelect('company.user', 'user')
            .leftJoinAndSelect('company.activitySector', 'activitySector')
            .leftJoinAndSelect('company.companySize', 'companySize')
            .leftJoinAndSelect('company.location', 'location')
            .where('1 = 1'); // Base condition to allow adding AND conditions
        
        // Apply active filter only if explicitly provided
        if (isActive !== undefined) {
            queryBuilder.andWhere('company.isActive = :isActive', { isActive });
        }
        
        // Apply search filter
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(company.companyName) LIKE LOWER(:search) OR LOWER(company.description) LIKE LOWER(:search) OR LOWER(company.registrationNumber) LIKE LOWER(:search) OR LOWER(company.taxNumber) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }
        
        // Apply verification filter
        if (isVerified !== undefined) {
            queryBuilder.andWhere('company.isVerified = :isVerified', { isVerified });
        }
        
        // Apply compliance filter
        if (isCompliantWithLaw !== undefined) {
            queryBuilder.andWhere('company.isCompliantWithLaw = :isCompliantWithLaw', { isCompliantWithLaw });
        }
        
        // Apply disability quota subject filter
        if (isSubjectToDisabilityQuota !== undefined) {
            queryBuilder.andWhere('company.isSubjectToDisabilityQuota = :isSubjectToDisabilityQuota', { isSubjectToDisabilityQuota });
        }
        
        // Apply activity sector filter
        if (activitySectorId) {
            queryBuilder.andWhere('company.activitySectorId = :activitySectorId', { activitySectorId });
        }
        
        // Apply company size filter
        if (companySizeId) {
            queryBuilder.andWhere('company.companySizeId = :companySizeId', { companySizeId });
        }
        
        // Apply location filter
        if (locationId) {
            queryBuilder.andWhere('company.locationId = :locationId', { locationId });
        }
        
        // Apply employee count filters
        if (minEmployeeCount !== undefined) {
            queryBuilder.andWhere(
                '(company.exactEmployeeCount IS NOT NULL AND company.exactEmployeeCount >= :minEmployeeCount)',
                { minEmployeeCount }
            );
        }
        if (maxEmployeeCount !== undefined) {
            queryBuilder.andWhere(
                '(company.exactEmployeeCount IS NOT NULL AND company.exactEmployeeCount <= :maxEmployeeCount)',
                { maxEmployeeCount }
            );
        }
        
        // Apply sorting
        queryBuilder.orderBy('company.companyName', 'ASC')
                    .addOrderBy('company.createdAt', 'DESC');
        
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

    async findOne(id: string): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: [
                'user',
                'activitySector',
                'companySize',
                'location'
            ],
        });

        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }

        return company;
    }

    async findByUserId(userId: string): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: { userId },
            relations: [
                'user',
                'activitySector',
                'companySize',
                'location'
            ],
        });

        if (!company) {
            throw new NotFoundException(`Company with user ID ${userId} not found`);
        }

        return company;
    }

    async findCompliantCompanies(): Promise<Company[]> {
        return this.companyRepository.find({
            where: {
                isActive: true,
                isCompliantWithLaw: true
            },
            relations: ['user', 'activitySector', 'companySize', 'location'],
        });
    }

    async findNonCompliantCompanies(): Promise<Company[]> {
        return this.companyRepository.find({
            where: {
                isActive: true,
                isSubjectToDisabilityQuota: true,
                isCompliantWithLaw: false
            },
            relations: ['user', 'activitySector', 'companySize', 'location'],
        });
    }

    async create(createData: Partial<Company>): Promise<Company> {
        const company = this.companyRepository.create(createData);
        const savedCompany = await this.companyRepository.save(company);

        // Calculate initial compliance after creation
        await this.updateComplianceStatus(savedCompany.id);

        return this.findOne(savedCompany.id);
    }

    async update(id: string, updateData: Partial<Company>): Promise<Company> {
        await this.findOne(id);
        await this.companyRepository.update(id, updateData);

        // Recalculate compliance if employee count changed
        if (updateData.exactEmployeeCount !== undefined) {
            await this.updateComplianceStatus(id);
        }

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.companyRepository.update(id, { isActive: false });
    }

    async updateComplianceStatus(id: string): Promise<void> {
        const company = await this.findOne(id);

        // Check if company is subject to disability quota
        const isSubjectToQuota = company.exactEmployeeCount >= 100 ||
            (company.companySize?.requiresDisabilityQuota === true);

        let isCompliant = true;
        let requiredCount = 0;
        let currentPercentage = 0;

        if (isSubjectToQuota && company.exactEmployeeCount) {
            // Calculate required disabled employees (2% by default)
            const quotaPercentage = company.companySize?.disabilityQuotaPercentage || 2.0;
            requiredCount = Math.ceil((company.exactEmployeeCount * quotaPercentage) / 100);

            // Calculate current compliance percentage
            currentPercentage = company.exactEmployeeCount > 0 ?
                (company.currentDisabledEmployeesCount / company.exactEmployeeCount) * 100 : 0;

            isCompliant = company.currentDisabledEmployeesCount >= requiredCount;
        }

        await this.companyRepository.update(id, {
            isSubjectToDisabilityQuota: isSubjectToQuota,
            requiredDisabledEmployeesCount: requiredCount,
            currentCompliancePercentage: parseFloat(currentPercentage.toFixed(2)),
            isCompliantWithLaw: isCompliant,
            lastComplianceCheckDate: new Date(),
        });
    }

    async updateProfileCompletion(id: string): Promise<void> {
        const company = await this.findOne(id);

        let completionScore = 0;
        const totalFields = 12;

        // Basic company info (6 points)
        if (company.companyName) completionScore++;
        if (company.registrationNumber) completionScore++;
        if (company.activitySectorId) completionScore++;
        if (company.companySizeId) completionScore++;
        if (company.locationId) completionScore++;
        if (company.description) completionScore++;

        // Contact info (3 points)
        if (company.hrContactName) completionScore++;
        if (company.hrContactEmail) completionScore++;
        if (company.hrContactPhone) completionScore++;

        // Additional info (3 points)
        if (company.website) completionScore++;
        if (company.logoUrl) completionScore++;
        if (company.exactEmployeeCount) completionScore++;

        const percentage = Math.round((completionScore / totalFields) * 100);
        const isComplete = percentage >= 80;

        await this.companyRepository.update(id, {
            profileCompletionPercentage: percentage,
            isProfileComplete: isComplete,
        });
    }

    /**
     * Find companies pending verification
     */
    async findPendingVerification(): Promise<Company[]> {
        return this.companyRepository.find({
            where: {
                isActive: true,
                isVerified: false
            },
            relations: [
                'user',
                'activitySector',
                'companySize',
                'location'
            ],
            order: { createdAt: 'ASC' }
        });
    }

    /**
     * Validate or reject a company
     */
    async validateCompany(id: string, validationDto: ValidateCompanyDto): Promise<CompanyValidationResponseDto> {
        const company = await this.findOne(id);

        if (company.isVerified && validationDto.approve) {
            throw new Error('Company is already verified');
        }

        const updateData: Partial<Company> = {
            isVerified: validationDto.approve,
            verificationDate: validationDto.approve ? new Date() : undefined,
            verificationNotes: validationDto.verificationNotes,
            canPostJobOffers: validationDto.approve ? (validationDto.canPostJobOffers ?? true) : false,
        };

        // If rejecting, also deactivate the company
        if (!validationDto.approve) {
            updateData.isActive = false;
        }

        await this.companyRepository.update(id, updateData);

        const action = validationDto.approve ? 'approved' : 'rejected';
        const message = validationDto.approve
            ? 'Company has been successfully approved and can now post job offers'
            : 'Company has been rejected and deactivated';

        return {
            success: true,
            companyId: id,
            action,
            message,
            isVerified: validationDto.approve,
            canPostJobOffers: validationDto.approve ? (validationDto.canPostJobOffers ?? true) : false,
            verificationDate: validationDto.approve ? new Date() : new Date(),
        };
    }

    /**
     * Find verified companies only
     */
    async findVerifiedCompanies(): Promise<Company[]> {
        return this.companyRepository.find({
            where: {
                isActive: true,
                isVerified: true
            },
            relations: [
                'user',
                'activitySector', 
                'companySize',
                'location'
            ],
        });
    }

    /**
     * Check if a company is verified and can post job offers
     */
    async isCompanyVerified(companyId: string): Promise<boolean> {
        const company = await this.companyRepository.findOne({
            where: { id: companyId },
            select: ['isVerified', 'canPostJobOffers', 'isActive']
        });

        return company ? (company.isVerified && company.canPostJobOffers && company.isActive) : false;
    }
} 