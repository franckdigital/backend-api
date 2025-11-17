import { IsString, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';

/**
 * DTO for creating a new disability type
 */
export class CreateDisabilityTypeDto {
    @ApiProperty({
        description: 'Name of the disability type',
        example: 'Visual Impairment',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the disability type',
        example: 'Conditions affecting vision including blindness and partial sight'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the disability type is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying disability types',
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
 * DTO for updating an existing disability type
 */
export class UpdateDisabilityTypeDto extends PartialType(CreateDisabilityTypeDto) {
    @ApiPropertyOptional({
        description: 'Name of the disability type',
        example: 'Visual and Hearing Impairment',
        minLength: 2,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name?: string;
}

/**
 * DTO for disability type response
 */
export class DisabilityTypeResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the disability type',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the disability type',
        example: 'Visual Impairment'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the disability type',
        example: 'Conditions affecting vision including blindness and partial sight',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Whether the disability type is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying disability types',
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
 * DTO for paginated disability types query
 */
export class DisabilityTypePageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in name and description',
        example: 'visual'
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
 * DTO for paginated disability types response
 */
export class PagedDisabilityTypesResponseDto {
    @ApiProperty({
        description: 'Array of disability types',
        type: [DisabilityTypeResponseDto],
    })
    data: DisabilityTypeResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 12,
            page: 1,
            size: 10,
            totalPages: 2,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 