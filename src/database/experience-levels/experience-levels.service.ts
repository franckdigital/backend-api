import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { ExperienceLevelPageQueryDto } from './experience-levels.dto';

@Injectable()
export class ExperienceLevelsService {
    constructor(
        @InjectRepository(ExperienceLevel)
        private readonly experienceLevelRepository: Repository<ExperienceLevel>,
    ) { }

    async findAll(): Promise<ExperienceLevel[]> {
        return this.experienceLevelRepository.find({
            where: { isActive: true },
            order: { minYears: 'ASC', sortOrder: 'ASC' },
        });
    }

    /**
     * Find experience levels with pagination and search
     */
    async findWithPagination(queryOptions: ExperienceLevelPageQueryDto) {
        const { page = 1, size = 10, search, isActive = true, minYears, maxYears } = queryOptions;
        
        const queryBuilder = this.experienceLevelRepository.createQueryBuilder('experienceLevel');
        
        // Apply active filter
        queryBuilder.where('experienceLevel.isActive = :isActive', { isActive });
        
        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(experienceLevel.name) LIKE LOWER(:search) OR LOWER(experienceLevel.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        
        // Apply years filters
        if (minYears !== undefined) {
            queryBuilder.andWhere('experienceLevel.minYears >= :minYears', { minYears });
        }
        if (maxYears !== undefined) {
            queryBuilder.andWhere(
                '(experienceLevel.maxYears IS NULL OR experienceLevel.maxYears <= :maxYears)',
                { maxYears }
            );
        }
        
        // Apply sorting
        queryBuilder.orderBy('experienceLevel.minYears', 'ASC')
                    .addOrderBy('experienceLevel.sortOrder', 'ASC');
        
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

    async findOne(id: string): Promise<ExperienceLevel> {
        const experienceLevel = await this.experienceLevelRepository.findOne({
            where: { id },
        });

        if (!experienceLevel) {
            throw new NotFoundException(`Experience level with ID ${id} not found`);
        }

        return experienceLevel;
    }

    async create(createData: Partial<ExperienceLevel>): Promise<ExperienceLevel> {
        const experienceLevel = this.experienceLevelRepository.create(createData);
        return this.experienceLevelRepository.save(experienceLevel);
    }

    async update(id: string, updateData: Partial<ExperienceLevel>): Promise<ExperienceLevel> {
        await this.findOne(id);
        await this.experienceLevelRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.experienceLevelRepository.update(id, { isActive: false });
    }
} 