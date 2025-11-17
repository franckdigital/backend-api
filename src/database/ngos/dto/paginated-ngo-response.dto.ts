import { ApiProperty } from '@nestjs/swagger';
import { NgoResponseDto } from './ngo-response.dto';

export class PaginationMetaDto {
    @ApiProperty({ description: 'Current page number' })
    page: number;

    @ApiProperty({ description: 'Number of items per page' })
    size: number;

    @ApiProperty({ description: 'Total number of items' })
    total: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;

    @ApiProperty({ description: 'Has next page' })
    hasNext: boolean;

    @ApiProperty({ description: 'Has previous page' })
    hasPrevious: boolean;
}

export class PaginatedNgoResponseDto {
    @ApiProperty({ description: 'Array of NGOs', type: [NgoResponseDto] })
    data: NgoResponseDto[];

    @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
    meta: PaginationMetaDto;
} 