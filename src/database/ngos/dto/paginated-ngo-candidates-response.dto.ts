import { ApiProperty } from '@nestjs/swagger';
import { CandidateResponseDto } from '../../candidates/candidates.dto';

export class PaginatedNgoCandidatesMetaDto {
    @ApiProperty({ description: 'Current page number', example: 1 })
    page: number;

    @ApiProperty({ description: 'Number of items per page', example: 10 })
    size: number;

    @ApiProperty({ description: 'Total number of items', example: 100 })
    total: number;

    @ApiProperty({ description: 'Total number of pages', example: 10 })
    totalPages: number;

    @ApiProperty({ description: 'Has next page', example: true })
    hasNext: boolean;

    @ApiProperty({ description: 'Has previous page', example: false })
    hasPrevious: boolean;
}

export class PaginatedNgoCandidatesResponseDto {
    @ApiProperty({
        description: 'Array of candidates',
        type: [CandidateResponseDto],
    })
    data: CandidateResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: PaginatedNgoCandidatesMetaDto,
    })
    meta: PaginatedNgoCandidatesMetaDto;
} 