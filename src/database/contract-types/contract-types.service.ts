import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractType } from '../entities/contract-type.entity';
import { ContractTypePageQueryDto } from './contract-types.dto';

@Injectable()
export class ContractTypesService {
    constructor(
        @InjectRepository(ContractType)
        private readonly contractTypeRepository: Repository<ContractType>,
    ) { }

    async findAll(): Promise<ContractType[]> {
        return this.contractTypeRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    /**
     * Find contract types with pagination and search
     */
    async findWithPagination(queryOptions: ContractTypePageQueryDto) {
        const { page = 1, size = 10, search, isActive = true } = queryOptions;
        
        const queryBuilder = this.contractTypeRepository.createQueryBuilder('contractType');
        
        // Apply active filter
        queryBuilder.where('contractType.isActive = :isActive', { isActive });
        
        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(contractType.name) LIKE LOWER(:search) OR LOWER(contractType.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        
        // Apply sorting
        queryBuilder.orderBy('contractType.sortOrder', 'ASC')
                    .addOrderBy('contractType.name', 'ASC');
        
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

    async findOne(id: string): Promise<ContractType> {
        const contractType = await this.contractTypeRepository.findOne({
            where: { id },
        });

        if (!contractType) {
            throw new NotFoundException(`Contract type with ID ${id} not found`);
        }

        return contractType;
    }

    async create(createData: Partial<ContractType>): Promise<ContractType> {
        const contractType = this.contractTypeRepository.create(createData);
        return this.contractTypeRepository.save(contractType);
    }

    async update(id: string, updateData: Partial<ContractType>): Promise<ContractType> {
        const existingContractType = await this.findOne(id);
        await this.contractTypeRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const contractType = await this.findOne(id);
        await this.contractTypeRepository.remove(contractType);
    }
} 