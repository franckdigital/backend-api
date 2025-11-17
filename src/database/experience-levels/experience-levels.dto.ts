import { IsString, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';

/**
 * DTO for creating a new experience level
 */
export class CreateExperienceLevelDto {
    @ApiProperty({
        description: 'Name of the experience level',
        example: 'Junior Level',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the experience level',
        example: 'Entry-level position for candidates with 0-2 years of experience'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Minimum years of experience required',
        example: 0,
        minimum: 0
    })
    @IsInt()
    @Min(0, { message: 'Minimum years must be a non-negative integer' })
    minYears: number;

    @ApiPropertyOptional({
        description: 'Maximum years of experience (null for unlimited)',
        example: 2,
        minimum: 0,
        nullable: true
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Maximum years must be a non-negative integer' })
    maxYears?: number;

    @ApiPropertyOptional({
        description: 'Whether the experience level is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying experience levels',
        example: 1,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Sort order must be a non-negative integer' })
    sortOrder?: number;
}

/**
 * DTO for updating an existing experience level
 */
export class UpdateExperienceLevelDto extends PartialType(CreateExperienceLevelDto) {
    @ApiPropertyOptional({
        description: 'Name of the experience level',
        example: 'Junior/Entry Level',
        minLength: 2,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name?: string;
}

/**
 * DTO for experience level response
 */
export class ExperienceLevelResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the experience level',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the experience level',
        example: 'Junior Level'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the experience level',
        example: 'Entry-level position for candidates with 0-2 years of experience',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Minimum years of experience required',
        example: 0
    })
    minYears: number;

    @ApiProperty({
        description: 'Maximum years of experience (null for unlimited)',
        example: 2,
        nullable: true
    })
    maxYears: number | null;

    @ApiProperty({
        description: 'Whether the experience level is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying experience levels',
        example: 1
    })
    sortOrder: number;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T12:00:00.000Z'
    })
    updatedAt: Date;
}

/**
 * DTO for paginated experience levels query
 */
export class ExperienceLevelPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in name and description',
        example: 'junior'
    })
    @IsOptional()
    @IsString()
    declare search?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Filter by minimum years of experience',
        example: 0,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Minimum years filter must be a non-negative integer' })
    minYears?: number;

    @ApiPropertyOptional({
        description: 'Filter by maximum years of experience',
        example: 5,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Maximum years filter must be a non-negative integer' })
    maxYears?: number;
}

/**
 * DTO for paginated experience levels response
 */
export class PagedExperienceLevelsResponseDto {
    @ApiProperty({
        description: 'Array of experience levels',
        type: [ExperienceLevelResponseDto],
    })
    data: ExperienceLevelResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 6,
            page: 1,
            size: 10,
            totalPages: 1,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 