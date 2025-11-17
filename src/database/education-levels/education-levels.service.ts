import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationLevel } from '../entities/education-level.entity';
import { EducationLevelPageQueryDto } from './education-levels.dto';

@Injectable()
export class EducationLevelsService {
    constructor(
        @InjectRepository(EducationLevel)
        private readonly educationLevelRepository: Repository<EducationLevel>,
    ) { }

    async findAll(): Promise<EducationLevel[]> {
        return this.educationLevelRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }

    /**
     * Find education levels with pagination and search
     */
    async findWithPagination(queryOptions: EducationLevelPageQueryDto) {
        const { page = 1, size = 10, search, isActive = true } = queryOptions;
        
        const queryBuilder = this.educationLevelRepository.createQueryBuilder('educationLevel');
        
        // Apply active filter
        queryBuilder.where('educationLevel.isActive = :isActive', { isActive });
        
        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(educationLevel.name) LIKE LOWER(:search) OR LOWER(educationLevel.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        
        // Apply sorting
        queryBuilder.orderBy('educationLevel.sortOrder', 'ASC');
        
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

    async findOne(id: string): Promise<EducationLevel> {
        const educationLevel = await this.educationLevelRepository.findOne({
            where: { id },
        });

        if (!educationLevel) {
            throw new NotFoundException(`Education level with ID ${id} not found`);
        }

        return educationLevel;
    }

    async create(createData: Partial<EducationLevel>): Promise<EducationLevel> {
        const educationLevel = this.educationLevelRepository.create(createData);
        return this.educationLevelRepository.save(educationLevel);
    }

    async update(id: string, updateData: Partial<EducationLevel>): Promise<EducationLevel> {
        await this.findOne(id);
        await this.educationLevelRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.educationLevelRepository.update(id, { isActive: false });
    }
} 