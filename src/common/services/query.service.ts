import { Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindOptionsOrder, Like, FindOptionsSelect, LessThan, MoreThan, FindManyOptions, ObjectLiteral } from 'typeorm';
import { QueryOptionsDto, SortOrder, PageQueryDto } from '../dto/query-options.dto';

@Injectable()
export class QueryService {
    /**
     * Build a TypeORM filter query based on query parameters
     */
    buildFilterQuery<T extends ObjectLiteral>(queryOptions: any, additionalFilters: FindOptionsWhere<T> = {}): FindOptionsWhere<T> {
        const filter = { ...additionalFilters } as FindOptionsWhere<T>;

        // Handle search parameter
        // Note: For MySQL compatibility, we need to handle case-insensitive search differently
        // This basic implementation now uses LIKE - consider using queryBuilder for more complex searches
        if (queryOptions.search && typeof queryOptions.search === 'string') {
            const searchCriteria = [
                { name: Like(`%${queryOptions.search}%`) },
                { description: Like(`%${queryOptions.search}%`) }
            ];
            
            // Need to manually implement $or functionality
            return searchCriteria.map(criteria => ({ ...filter, ...criteria })) as any;
        }

        // Handle active status filter
        if (queryOptions.isActive !== undefined) {
            (filter as any).isActive = queryOptions.isActive;
        }

        return filter;
    }

    /**
     * Build a TypeORM cursor-based query
     */
    buildCursorQuery<T extends ObjectLiteral>(
        queryOptions: QueryOptionsDto,
        additionalFilters: FindOptionsWhere<T> = {},
        lastItem?: Record<string, any> | null
    ): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
        const filter = this.buildFilterQuery<T>(queryOptions, additionalFilters);

        // Add cursor-based filtering if a cursor is provided
        if (queryOptions.cursor && lastItem) {
            const sortField = queryOptions.sortBy || 'createdAt';
            const sortOrder = queryOptions.sortOrder || SortOrder.DESC;

            // Build cursor-based filters for TypeORM
            if (sortOrder === SortOrder.DESC) {
                if (Array.isArray(filter)) {
                    return filter.map(f => ({
                        ...f,
                        [sortField]: LessThan(lastItem[sortField])
                    }));
                } else {
                    return {
                        ...filter,
                        [sortField]: LessThan(lastItem[sortField])
                    };
                }
            } else {
                if (Array.isArray(filter)) {
                    return filter.map(f => ({
                        ...f,
                        [sortField]: MoreThan(lastItem[sortField])
                    }));
                } else {
                    return {
                        ...filter,
                        [sortField]: MoreThan(lastItem[sortField])
                    };
                }
            }
        }

        return filter;
    }

    /**
     * Build sort options for TypeORM query
     */
    buildSortOptions(queryOptions: QueryOptionsDto): FindOptionsOrder<any> {
        const sortField = queryOptions.sortBy || 'createdAt';
        const sortOrder = queryOptions.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        return {
            [sortField]: sortOrder,
            id: sortOrder // Always include id for consistent pagination
        } as FindOptionsOrder<any>;
    }

    /**
     * Build projection options for TypeORM query
     */
    buildProjection<T extends ObjectLiteral>(queryOptions: QueryOptionsDto): FindOptionsSelect<T> {
        if (!queryOptions.fields) return {} as FindOptionsSelect<T>;

        const fields = queryOptions.fields.split(',').map(field => field.trim());
        const projection: Record<string, boolean> = {};

        fields.forEach(field => {
            projection[field] = true;
        });

        return projection as FindOptionsSelect<T>;
    }

    /**
     * Execute a cursor-based paginated query
     */
    async executeCursorPaginatedQuery<T extends ObjectLiteral>(
        repository: Repository<T>,
        queryOptions: QueryOptionsDto,
        additionalFilters: FindOptionsWhere<T> = {}
    ): Promise<{ data: T[]; nextCursor: string | null; total: number }> {
        const limit = queryOptions.limit || 10;
        let lastItem: Record<string, any> | null = null;

        // If cursor is provided, fetch the last item to use for comparison
        if (queryOptions.cursor) {
            try {
                const item = await repository.findOne({
                    where: { id: queryOptions.cursor } as unknown as FindOptionsWhere<T>
                });
                if (item) {
                    lastItem = item as any;
                }
            } catch (error) {
                console.error('Error fetching cursor item:', error);
            }
        }

        // Build the filter query based on cursor and other filters
        const where = this.buildCursorQuery<T>(queryOptions, additionalFilters, lastItem);
        const order = this.buildSortOptions(queryOptions);
        const select = this.buildProjection<T>(queryOptions);

        // Build the options for TypeORM
        const options: FindManyOptions<T> = {
            where,
            order,
            select,
            take: limit + 1, // Get one extra to determine if there are more results
        };

        // Execute the query
        const data = await repository.find(options);

        // Determine if there are more results and calculate the next cursor
        const hasMore = data.length > limit;
        const results = hasMore ? data.slice(0, limit) : data;

        // Get the next cursor from the last item in results
        let nextCursor: string | null = null;
        if (hasMore && results.length > 0) {
            const lastResultItem = results[results.length - 1] as any;
            if (lastResultItem.id) {
                nextCursor = lastResultItem.id;
            }
        }

        // Get total count (for informational purposes)
        const total = await repository.count({ where: this.buildFilterQuery<T>(queryOptions, additionalFilters) });

        return {
            data: results,
            nextCursor,
            total
        };
    }

    /**
     * Execute a standard pagination query using page and size
     */
    async executePagedQuery<T extends ObjectLiteral>(
        repository: Repository<T>,
        queryOptions: PageQueryDto,
        additionalFilters: FindOptionsWhere<T> = {}
    ): Promise<{ data: T[]; totalPages: number; currentPage: number; totalItems: number }> {
        const page = queryOptions.page || 1;
        const size = queryOptions.size || 10;
        const skip = (page - 1) * size;
        
        // Build the filter query based on filters
        const where = this.buildFilterQuery<T>(queryOptions, additionalFilters);
        const order = this.buildSortOptions(queryOptions);
        const select = this.buildProjection<T>(queryOptions);
        
        // Execute the query
        const options: FindManyOptions<T> = {
            where,
            order,
            select,
            skip,
            take: size
        };
        
        const data = await repository.find(options);
        
        // Get total count for pagination info
        const totalItems = await repository.count({ where });
        const totalPages = Math.ceil(totalItems / size);
        
        return {
            data,
            currentPage: page,
            totalPages,
            totalItems
        };
    }
} 