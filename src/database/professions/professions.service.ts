import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Profession } from '../entities/profession.entity';
import { CreateProfessionDto, UpdateProfessionDto, ProfessionPageQueryDto, PagedProfessionsResponseDto } from './professions.dto';

/**
 * Service handling profession operations
 */
@Injectable()
export class ProfessionsService {
    constructor(
        @InjectRepository(Profession)
        private professionsRepository: Repository<Profession>,
    ) { }

    /**
     * Get all active professions ordered by sort order and name
     */
    async findAll(): Promise<Profession[]> {
        return this.professionsRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' }
        });
    }

    /**
     * Get professions with pagination and search
     */
    async findWithPagination(queryOptions: ProfessionPageQueryDto): Promise<PagedProfessionsResponseDto> {
        const { page = 1, size = 10, search, isActive } = queryOptions;
        const skip = (page - 1) * size;

        const whereCondition: any = {};

        // if (isActive !== undefined) {
        //     whereCondition.isActive = isActive;
        // }

        // Note: MySQL doesn't support ILIKE, using query builder for case-insensitive search
        let queryBuilder = this.professionsRepository.createQueryBuilder('profession');
        
        if (isActive !== undefined) {
            queryBuilder = queryBuilder.where('profession.isActive = :isActive', { isActive });
        }

        if (search) {
            const searchCondition = isActive !== undefined ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[searchCondition](
                'LOWER(profession.name) LIKE LOWER(:search)',
                { search: `%${search}%` }
            );
        }

        queryBuilder = queryBuilder
            .orderBy('profession.sortOrder', 'ASC')
            .addOrderBy('profession.name', 'ASC')
            .skip(skip)
            .take(size);

        const [professions, total] = await queryBuilder.getManyAndCount();

        return {
            data: professions,
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
        };
    }

    /**
     * Find one profession by ID
     */
    async findOne(id: string): Promise<Profession> {
        const profession = await this.professionsRepository.findOne({
            where: { id }
        });

        if (!profession) {
            throw new NotFoundException(`Profession with ID ${id} not found`);
        }

        return profession;
    }

    /**
     * Create a new profession
     */
    async create(createProfessionDto: CreateProfessionDto): Promise<Profession> {
        // Check if profession with same name already exists
        const existingProfession = await this.professionsRepository.findOne({
            where: { name: createProfessionDto.name }
        });

        if (existingProfession) {
            throw new ConflictException(`Profession with name '${createProfessionDto.name}' already exists`);
        }

        const profession = this.professionsRepository.create(createProfessionDto);
        return this.professionsRepository.save(profession);
    }

    /**
     * Update an existing profession
     */
    async update(id: string, updateProfessionDto: UpdateProfessionDto): Promise<Profession> {
        const profession = await this.findOne(id);

        // Check if new name conflicts with existing profession
        if (updateProfessionDto.name && updateProfessionDto.name !== profession.name) {
            const existingProfession = await this.professionsRepository.findOne({
                where: { name: updateProfessionDto.name }
            });

            if (existingProfession) {
                throw new ConflictException(`Profession with name '${updateProfessionDto.name}' already exists`);
            }
        }

        Object.assign(profession, updateProfessionDto);
        return this.professionsRepository.save(profession);
    }

    /**
     * Soft delete a profession (set isActive to false)
     */
    async remove(id: string): Promise<void> {
        const profession = await this.findOne(id);
        profession.isActive = false;
        await this.professionsRepository.save(profession);
    }
} 