import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { QueryService } from '../../common/services/query.service';
import { PageQueryDto } from '../../common/dto/query-options.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly queryService: QueryService
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        // Remove metadata field if present
        const { metadata, ...categoryData } = createCategoryDto;
        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }

    async findAll(queryOptions: CategoryQueryDto = {}) {
        return this.findWithFilters(queryOptions);
    }

    async findOne(id: string, fields?: string): Promise<Category | null> {
        const options: any = { where: { id } };
        
        if (fields) {
            options.select = this.buildSelect(fields);
        }
        
        return this.categoryRepository.findOne(options);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
        // Remove metadata field if present
        const { metadata, ...categoryData } = updateCategoryDto;
        
        const category = await this.categoryRepository.findOne({ where: { id } });
        
        if (!category) {
            return null;
        }
        
        Object.assign(category, categoryData);
        return this.categoryRepository.save(category);
    }

    async remove(id: string): Promise<Category | null> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        
        if (!category) {
            return null;
        }
        
        await this.categoryRepository.remove(category);
        return category;
    }

    /**
     * Find categories with advanced filtering, sorting, and pagination
     */
    async findWithFilters(queryOptions: CategoryQueryDto = {}) {
        const { search, sortBy, sortOrder, limit = 10, cursor } = queryOptions;
        
        const queryBuilder = this.categoryRepository.createQueryBuilder('category');
        
        // Apply category-specific filters
        this.applyCategoryFilters(queryBuilder, queryOptions);
        
        // Apply search
        if (search) {
            queryBuilder.andWhere(
                'category.name LIKE :search OR category.description LIKE :search',
                { search: `%${search}%` }
            );
        }
        
        // Apply cursor-based pagination
        if (cursor) {
            queryBuilder.andWhere('category.id > :cursor', { cursor });
        }
        
        // Apply sorting
        if (sortBy) {
            queryBuilder.orderBy(`category.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('category.order', 'ASC');
        }
        
        // Limit results
        queryBuilder.take(limit);
        
        // Get results
        const categories = await queryBuilder.getMany();
        
        // Get next cursor
        const nextCursor = categories.length > 0 ? categories[categories.length - 1].id : null;
        
        return {
            data: categories,
            cursor: nextCursor,
            hasMore: categories.length === limit
        };
    }

    /**
     * Helper method to apply category-specific filters to a query builder
     */
    private applyCategoryFilters(queryBuilder: any, queryOptions: CategoryQueryDto | PageQueryDto): void {
        // Apply order range filters
        if ('minOrder' in queryOptions && 'maxOrder' in queryOptions && 
            queryOptions.minOrder !== undefined && queryOptions.maxOrder !== undefined) {
            queryBuilder.andWhere('category.order BETWEEN :minOrder AND :maxOrder', {
                minOrder: queryOptions.minOrder,
                maxOrder: queryOptions.maxOrder
            });
        } else if ('minOrder' in queryOptions && queryOptions.minOrder !== undefined) {
            queryBuilder.andWhere('category.order >= :minOrder', {
                minOrder: queryOptions.minOrder
            });
        } else if ('maxOrder' in queryOptions && queryOptions.maxOrder !== undefined) {
            queryBuilder.andWhere('category.order <= :maxOrder', {
                maxOrder: queryOptions.maxOrder
            });
        }
        
        // Apply isActive filter if available
        if ('isActive' in queryOptions && queryOptions.isActive !== undefined) {
            queryBuilder.andWhere('category.isActive = :isActive', {
                isActive: queryOptions.isActive
            });
        }
    }

    /**
     * Helper method to build TypeORM select object from fields string
     */
    private buildSelect(fields: string): string[] {
        return fields.split(',').map(field => field.trim());
    }

    /**
     * Find categories with standard page-based pagination
     */
    async findWithPagePagination(queryOptions: PageQueryDto) {
        const { page = 1, size = 10, search, sortBy, sortOrder } = queryOptions;
        
        const queryBuilder = this.categoryRepository.createQueryBuilder('category');
        
        // Apply category-specific filters
        this.applyCategoryFilters(queryBuilder, queryOptions);
        
        // Apply search
        if (search) {
            queryBuilder.andWhere(
                'category.name LIKE :search OR category.description LIKE :search',
                { search: `%${search}%` }
            );
        }
        
        // Apply sorting
        if (sortBy) {
            queryBuilder.orderBy(`category.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('category.order', 'ASC');
        }
        
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

    async findAllTree(): Promise<Category[]> {
        const categories = await this.categoryRepository.find({
            where: { isActive: true },
            relations: ['parent', 'children'],
            order: { order: 'ASC' }
        });

        // Build tree structure
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: map all categories by ID
        categories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                children: []
            });
        });

        // Second pass: build tree structure
        categories.forEach(category => {
            const mappedCategory = categoryMap.get(category.id);
            if (mappedCategory) {
                if (category.parentId) {
                    const parent = categoryMap.get(category.parentId);
                    if (parent) {
                        parent.children.push(mappedCategory);
                    }
                } else {
                    rootCategories.push(mappedCategory);
                }
            }
        });

        return rootCategories;
    }
} 