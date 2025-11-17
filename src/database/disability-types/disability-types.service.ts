import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisabilityType } from '../entities/disability-type.entity';
import { DisabilityTypePageQueryDto } from './disability-types.dto';

@Injectable()
export class DisabilityTypesService {
    constructor(
        @InjectRepository(DisabilityType)
        private readonly disabilityTypeRepository: Repository<DisabilityType>,
    ) { }

    /**
     * Find all active disability types
     */
    async findAll(): Promise<DisabilityType[]> {
        return this.disabilityTypeRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    /**
     * Find disability types with pagination and search
     */
    async findWithPagination(queryOptions: DisabilityTypePageQueryDto) {
        const { page = 1, size = 10, search, isActive = true } = queryOptions;
        
        const queryBuilder = this.disabilityTypeRepository.createQueryBuilder('disabilityType');
        
        // Apply active filter
        queryBuilder.where('disabilityType.isActive = :isActive', { isActive });
        
        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(disabilityType.name) LIKE LOWER(:search) OR LOWER(disabilityType.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        
        // Apply sorting
        queryBuilder.orderBy('disabilityType.sortOrder', 'ASC')
                    .addOrderBy('disabilityType.name', 'ASC');
        
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
     * Find disability type by ID
     */
    async findOne(id: string): Promise<DisabilityType> {
        const disabilityType = await this.disabilityTypeRepository.findOne({
            where: { id },
        });

        if (!disabilityType) {
            throw new NotFoundException(`Disability type with ID ${id} not found`);
        }

        return disabilityType;
    }

    /**
     * Create new disability type
     */
    async create(createData: Partial<DisabilityType>): Promise<DisabilityType> {
        const disabilityType = this.disabilityTypeRepository.create(createData);
        return this.disabilityTypeRepository.save(disabilityType);
    }

    /**
     * Update disability type
     */
    async update(id: string, updateData: Partial<DisabilityType>): Promise<DisabilityType> {
        const existingDisabilityType = await this.findOne(id);
        await this.disabilityTypeRepository.update(id, updateData);
        return this.findOne(id);
    }

    /**
     * Delete disability type (soft delete by setting isActive to false)
     */
    async remove(id: string): Promise<void> {
        const disabilityType = await this.findOne(id);
        await this.disabilityTypeRepository.remove(disabilityType);
    }
} 