import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new company size
 */
export class CreateCompanySizeDto {
    @ApiProperty({
        description: 'Name of the company size category',
        example: 'Small Enterprise',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the company size category',
        example: 'Companies with 10 to 49 employees',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Minimum number of employees for this category',
        example: 10,
        minimum: 0
    })
    @IsNumber()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    minEmployees: number;

    @ApiProperty({
        description: 'Maximum number of employees for this category (null for unlimited)',
        example: 49,
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    maxEmployees?: number;

    @ApiProperty({
        description: 'Whether this company size requires disability quota compliance',
        example: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    requiresDisabilityQuota?: boolean;

    @ApiProperty({
        description: 'Disability quota percentage required (e.g., 2.00 for 2%)',
        example: 2.00,
        required: false,
        nullable: true,
        minimum: 0,
        maximum: 100
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(100)
    @Type(() => Number)
    disabilityQuotaPercentage?: number;

    @ApiProperty({
        description: 'Whether this company size category is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Sort order for displaying company sizes',
        example: 0,
        default: 0,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    sortOrder?: number;
}

/**
 * DTO for updating an existing company size
 */
export class UpdateCompanySizeDto extends PartialType(CreateCompanySizeDto) {
    @ApiProperty({
        description: 'Name of the company size category',
        example: 'Medium Enterprise',
        maxLength: 100,
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiProperty({
        description: 'Minimum number of employees for this category',
        example: 50,
        minimum: 0,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    minEmployees?: number;
}

/**
 * DTO for company size query parameters
 */
export class CompanySizeQueryDto {
    @ApiProperty({
        description: 'Number of employees to find matching company size',
        example: 25,
        minimum: 0
    })
    @IsNumber()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    count: number;
}

/**
 * DTO for paginated company size query parameters
 */
export class PaginatedCompanySizeQueryDto {
    @ApiProperty({
        description: 'Page number (1-based)',
        example: 1,
        minimum: 1,
        default: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    size?: number = 10;

    @ApiProperty({
        description: 'Search term to filter company sizes by name or description',
        example: 'enterprise',
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string;
}

/**
 * DTO for company size response
 */
export class CompanySizeResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the company size',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the company size category',
        example: 'Small Enterprise'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the company size category',
        example: 'Companies with 10 to 49 employees',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Minimum number of employees for this category',
        example: 10
    })
    minEmployees: number;

    @ApiProperty({
        description: 'Maximum number of employees for this category',
        example: 49,
        nullable: true
    })
    maxEmployees: number | null;

    @ApiProperty({
        description: 'Whether this company size requires disability quota compliance',
        example: false
    })
    requiresDisabilityQuota: boolean;

    @ApiProperty({
        description: 'Disability quota percentage required',
        example: 2.00,
        nullable: true
    })
    disabilityQuotaPercentage: number | null;

    @ApiProperty({
        description: 'Whether this company size category is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying company sizes',
        example: 0
    })
    sortOrder: number;

    @ApiProperty({
        description: 'Creation date',
        example: '2024-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update date',
        example: '2024-01-15T10:30:00Z'
    })
    updatedAt: Date;
}

/**
 * DTO for pagination metadata
 */
export class PaginationMetaDto {
    @ApiProperty({
        description: 'Current page number',
        example: 1
    })
    currentPage: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 3
    })
    totalPages: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10
    })
    pageSize: number;

    @ApiProperty({
        description: 'Total number of items',
        example: 25
    })
    totalItems: number;

    @ApiProperty({
        description: 'Whether there is a next page',
        example: true
    })
    hasNext: boolean;

    @ApiProperty({
        description: 'Whether there is a previous page',
        example: false
    })
    hasPrevious: boolean;
}

/**
 * DTO for paginated company size response
 */
export class PaginatedCompanySizeResponseDto {
    @ApiProperty({
        description: 'List of company sizes for the current page',
        type: [CompanySizeResponseDto]
    })
    data: CompanySizeResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: PaginationMetaDto
    })
    meta: PaginationMetaDto;
} 