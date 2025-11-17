import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Array of items',
        isArray: true,
    })
    data: T[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 100,
            page: 1,
            size: 10,
            totalPages: 10,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 