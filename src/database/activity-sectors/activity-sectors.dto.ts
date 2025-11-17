import { IsString, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';

/**
 * DTO for creating a new activity sector
 */
export class CreateActivitySectorDto {
    @ApiProperty({
        description: 'Name of the activity sector',
        example: 'Information Technology',
        minLength: 2,
        maxLength: 150
    })
    @IsString()
    @Length(2, 150, { message: 'Name must be between 2 and 150 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the activity sector',
        example: 'Sector encompassing software development, IT services, and digital solutions'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the activity sector is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying activity sectors',
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
 * DTO for updating an existing activity sector
 */
export class UpdateActivitySectorDto extends PartialType(CreateActivitySectorDto) {
    @ApiPropertyOptional({
        description: 'Name of the activity sector',
        example: 'Information Technology & Digital Services',
        minLength: 2,
        maxLength: 150
    })
    @IsOptional()
    @IsString()
    @Length(2, 150, { message: 'Name must be between 2 and 150 characters' })
    name?: string;
}

/**
 * DTO for activity sector response
 */
export class ActivitySectorResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the activity sector',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the activity sector',
        example: 'Information Technology'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the activity sector',
        example: 'Sector encompassing software development, IT services, and digital solutions',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Whether the activity sector is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying activity sectors',
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
 * DTO for paginated activity sectors query
 */
export class ActivitySectorPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in name and description',
        example: 'technology'
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
 * DTO for paginated activity sectors response
 */
export class PagedActivitySectorsResponseDto {
    @ApiProperty({
        description: 'Array of activity sectors',
        type: [ActivitySectorResponseDto],
    })
    data: ActivitySectorResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 25,
            page: 1,
            size: 10,
            totalPages: 3,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 