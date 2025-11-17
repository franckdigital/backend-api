import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class NgoCandidatePaginationDto {
    @ApiPropertyOptional({
        description: 'Page number (starts from 1)',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    size?: number = 10;

    @ApiPropertyOptional({
        description: 'Search text in candidate name, email, professional summary, or skills',
        example: 'software engineer',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by availability status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isAvailable?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by profile completion status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isProfileComplete?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by disability type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID(4)
    disabilityTypeId?: string;

    @ApiPropertyOptional({
        description: 'Filter by education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID(4)
    educationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID(4)
    experienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by profession ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID(4)
    professionId?: string;

    @ApiPropertyOptional({
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'createdAt',
        enum: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'expectedSalaryMin', 'expectedSalaryMax'],
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'DESC',
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
} 