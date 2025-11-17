import { IsString, IsBoolean, IsOptional, IsInt, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new profession
 */
export class CreateProfessionDto {
    @ApiProperty({
        description: 'Name of the profession',
        example: 'Software Developer',
        maxLength: 100
    })
    @IsString()
    @Length(1, 100)
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the profession',
        example: 'Professional who designs, develops, and maintains software applications'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the profession is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for listing professions',
        example: 1,
        default: 0
    })
    @IsOptional()
    @IsInt()
    sortOrder?: number;
}

/**
 * DTO for updating a profession
 */
export class UpdateProfessionDto {
    @ApiPropertyOptional({
        description: 'Name of the profession',
        example: 'Senior Software Developer',
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    name?: string;

    @ApiPropertyOptional({
        description: 'Description of the profession',
        example: 'Experienced professional who leads software development projects'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the profession is active',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for listing professions',
        example: 1
    })
    @IsOptional()
    @IsInt()
    sortOrder?: number;
}

/**
 * DTO for profession response
 */
export class ProfessionResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the profession',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the profession',
        example: 'Software Developer'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the profession',
        example: 'Professional who designs, develops, and maintains software applications'
    })
    description: string;

    @ApiProperty({
        description: 'Whether the profession is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for listing professions',
        example: 1
    })
    sortOrder: number;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}

/**
 * DTO for profession pagination query parameters
 */
export class ProfessionPageQueryDto {
    @ApiPropertyOptional({
        description: 'Page number (starts at 1)',
        example: 1,
        default: 1
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: 10
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    size?: number = 10;

    @ApiPropertyOptional({
        description: 'Search term for name and description',
        example: 'developer'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;
}

/**
 * DTO for paginated profession response
 */
export class PagedProfessionsResponseDto {
    @ApiProperty({
        description: 'List of professions',
        type: [ProfessionResponseDto]
    })
    data: ProfessionResponseDto[];

    @ApiProperty({
        description: 'Total number of professions',
        example: 50
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10
    })
    size: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 5
    })
    totalPages: number;
} 