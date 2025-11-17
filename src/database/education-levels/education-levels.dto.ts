import { IsString, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';

/**
 * DTO for creating a new education level
 */
export class CreateEducationLevelDto {
    @ApiProperty({
        description: 'Name of the education level',
        example: 'Bachelor\'s Degree',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the education level',
        example: 'Undergraduate degree typically completed in 3-4 years'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the education level is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying education levels',
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
 * DTO for updating an existing education level
 */
export class UpdateEducationLevelDto extends PartialType(CreateEducationLevelDto) {
    @ApiPropertyOptional({
        description: 'Name of the education level',
        example: 'Bachelor\'s Degree (Honours)',
        minLength: 2,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name?: string;
}

/**
 * DTO for education level response
 */
export class EducationLevelResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the education level',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the education level',
        example: 'Bachelor\'s Degree'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the education level',
        example: 'Undergraduate degree typically completed in 3-4 years',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Whether the education level is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying education levels',
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
 * DTO for paginated education levels query
 */
export class EducationLevelPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in name and description',
        example: 'bachelor'
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
}

/**
 * DTO for paginated education levels response
 */
export class PagedEducationLevelsResponseDto {
    @ApiProperty({
        description: 'Array of education levels',
        type: [EducationLevelResponseDto],
    })
    data: EducationLevelResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 7,
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