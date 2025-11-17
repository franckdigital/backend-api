import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySize } from '../entities/company-size.entity';
import { 
    CreateCompanySizeDto, 
    UpdateCompanySizeDto, 
    CompanySizeResponseDto, 
    PaginatedCompanySizeQueryDto, 
    PaginatedCompanySizeResponseDto,
    PaginationMetaDto 
} from './company-sizes.dto';

@Injectable()
export class CompanySizesService {
    constructor(
        @InjectRepository(CompanySize)
        private readonly companySizeRepository: Repository<CompanySize>,
    ) { }

    /**
     * Find all active company sizes ordered by minimum employees and sort order
     * @returns Promise<CompanySizeResponseDto[]> List of active company sizes
     */
    async findAll(): Promise<CompanySizeResponseDto[]> {
        return this.companySizeRepository.find({
            where: { isActive: true },
            order: { minEmployees: 'ASC', sortOrder: 'ASC' },
        });
    }

    /**
     * Find company sizes with pagination and optional search
     * @param query - Pagination and search parameters
     * @returns Promise<PaginatedCompanySizeResponseDto> Paginated list of company sizes
     */
    async findAllPaginated(query: PaginatedCompanySizeQueryDto): Promise<PaginatedCompanySizeResponseDto> {
        const { page = 1, size = 10, search } = query;
        const skip = (page - 1) * size;

        const queryBuilder = this.companySizeRepository
            .createQueryBuilder('companySize')
            .where('companySize.isActive = :isActive', { isActive: true });

        // Add search filter if provided
        if (search && search.trim()) {
            queryBuilder.andWhere(
                '(LOWER(companySize.name) LIKE LOWER(:search) OR LOWER(companySize.description) LIKE LOWER(:search))',
                { search: `%${search.trim()}%` }
            );
        }

        // Add ordering
        queryBuilder
            .orderBy('companySize.minEmployees', 'ASC')
            .addOrderBy('companySize.sortOrder', 'ASC');

        // Get total count for pagination
        const totalItems = await queryBuilder.getCount();

        // Apply pagination
        const data = await queryBuilder
            .skip(skip)
            .take(size)
            .getMany();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / size);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        const meta: PaginationMetaDto = {
            currentPage: page,
            totalPages,
            pageSize: size,
            totalItems,
            hasNext,
            hasPrevious,
        };

        return {
            data,
            meta,
        };
    }

    /**
     * Find a company size by its ID
     * @param id - The unique identifier of the company size
     * @returns Promise<CompanySizeResponseDto> The company size found
     * @throws NotFoundException if company size is not found
     */
    async findOne(id: string): Promise<CompanySizeResponseDto> {
        const companySize = await this.companySizeRepository.findOne({
            where: { id },
        });

        if (!companySize) {
            throw new NotFoundException(`Company size with ID ${id} not found`);
        }

        return companySize;
    }

    /**
     * Find the appropriate company size based on employee count
     * @param employeeCount - Number of employees to match against
     * @returns Promise<CompanySizeResponseDto> The matching company size
     * @throws NotFoundException if no company size matches the employee count
     */
    async findByEmployeeCount(employeeCount: number): Promise<CompanySizeResponseDto> {
        const companySize = await this.companySizeRepository
            .createQueryBuilder('companySize')
            .where('companySize.minEmployees <= :count', { count: employeeCount })
            .andWhere('(companySize.maxEmployees IS NULL OR companySize.maxEmployees >= :count)', { count: employeeCount })
            .andWhere('companySize.isActive = true')
            .getOne();

        if (!companySize) {
            throw new NotFoundException(`Company size for ${employeeCount} employees not found`);
        }

        return companySize;
    }

    /**
     * Create a new company size
     * @param createData - The data to create the company size
     * @returns Promise<CompanySizeResponseDto> The created company size
     */
    async create(createData: CreateCompanySizeDto): Promise<CompanySizeResponseDto> {
        const companySize = this.companySizeRepository.create(createData);
        return this.companySizeRepository.save(companySize);
    }

    /**
     * Update an existing company size
     * @param id - The unique identifier of the company size to update
     * @param updateData - The data to update the company size with
     * @returns Promise<CompanySizeResponseDto> The updated company size
     * @throws NotFoundException if company size is not found
     */
    async update(id: string, updateData: UpdateCompanySizeDto): Promise<CompanySizeResponseDto> {
        await this.findOne(id); // This will throw NotFoundException if not found
        await this.companySizeRepository.update(id, updateData);
        return this.findOne(id);
    }

    /**
     * Soft delete a company size by setting isActive to false
     * @param id - The unique identifier of the company size to delete
     * @throws NotFoundException if company size is not found
     */
    async remove(id: string): Promise<void> {
        await this.findOne(id); // This will throw NotFoundException if not found
        await this.companySizeRepository.update(id, { isActive: false });
    }
} 