import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, IsEnum, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';
import { Transform, Type } from 'class-transformer';

/**
 * Job offer status enum
 */
export enum JobOfferStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    PAUSED = 'paused',
    EXPIRED = 'expired',
    CLOSED = 'closed'
}

/**
 * DTO for job offer pagination query parameters
 */
export class JobOfferPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in job title, description, or requirements',
        example: 'software developer'
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
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Filter by visible status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isVisible?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    @IsOptional()
    @IsEnum(JobOfferStatus)
    status?: JobOfferStatus;

    @ApiPropertyOptional({
        description: 'Filter by company ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    companyId?: string;

    @ApiPropertyOptional({
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    activitySectorId?: string;

    @ApiPropertyOptional({
        description: 'Filter by contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    contractTypeId?: string;

    @ApiPropertyOptional({
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Filter by minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumEducationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumExperienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by remote work possibility',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isRemoteWork?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by disability-friendly jobs',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isDisabilityFriendly?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by jobs exclusive for disabled candidates',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isExclusiveForDisabled?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by minimum salary',
        example: 30000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salaryMin?: number;

    @ApiPropertyOptional({
        description: 'Filter by maximum salary',
        example: 80000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salaryMax?: number;

    @ApiPropertyOptional({
        description: 'Filter by suitable disability type IDs',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsUUID(4, { each: true })
    suitableDisabilityTypeIds?: string[];
}

/**
 * DTO for job offer response
 */
export class JobOfferResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the job offer',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Company ID that posted the job offer',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    companyId: string;

    @ApiProperty({
        description: 'Job title',
        example: 'Senior Frontend Developer'
    })
    title: string;

    @ApiProperty({
        description: 'Job description',
        example: 'We are looking for an experienced frontend developer...'
    })
    description: string;

    @ApiProperty({
        description: 'Job requirements',
        example: '5+ years of experience with React, TypeScript knowledge...',
        nullable: true
    })
    requirements: string | null;

    @ApiProperty({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    activitySectorId: string | null;

    @ApiProperty({
        description: 'Contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    contractTypeId: string | null;

    @ApiProperty({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    locationId: string | null;

    @ApiProperty({
        description: 'Minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    minimumEducationLevelId: string | null;

    @ApiProperty({
        description: 'Minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    minimumExperienceLevelId: string | null;

    @ApiProperty({
        description: 'Minimum salary offered',
        example: 45000,
        nullable: true
    })
    salaryMin: number | null;

    @ApiProperty({
        description: 'Maximum salary offered',
        example: 65000,
        nullable: true
    })
    salaryMax: number | null;

    @ApiProperty({
        description: 'Currency for salary',
        example: 'EUR',
        nullable: true
    })
    salaryCurrency: string | null;

    @ApiProperty({
        description: 'Benefits offered',
        example: 'Health insurance, meal vouchers, transportation allowance',
        nullable: true
    })
    benefits: string | null;

    @ApiProperty({
        description: 'Whether remote work is possible',
        example: true
    })
    isRemoteWork: boolean;

    @ApiProperty({
        description: 'Whether job is disability-friendly',
        example: true
    })
    isDisabilityFriendly: boolean;

    @ApiProperty({
        description: 'Whether job is exclusive for disabled candidates',
        example: false
    })
    isExclusiveForDisabled: boolean;

    @ApiProperty({
        description: 'Types of disabilities suitable for this job offer',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Disability type ID' },
                name: { type: 'string', description: 'Disability type name' },
                description: { type: 'string', description: 'Disability type description' }
            }
        },
        example: [
            { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Surdité', description: 'Perte auditive' },
            { id: '456e7890-e89b-12d3-a456-426614174000', name: 'Mutité', description: 'Incapacité à parler' }
        ]
    })
    suitableDisabilityTypes: {
        id: string;
        name: string;
        description: string;
    }[];

    @ApiProperty({
        description: 'Job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    status: JobOfferStatus;

    @ApiProperty({
        description: 'Whether job offer is visible to candidates',
        example: true
    })
    isVisible: boolean;

    @ApiProperty({
        description: 'Whether job offer is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Application deadline',
        example: '2024-12-31T23:59:59.000Z',
        nullable: true
    })
    applicationDeadline: Date | null;

    @ApiProperty({
        description: 'Publication date',
        example: '2024-01-01T00:00:00.000Z',
        nullable: true
    })
    publishedAt: Date | null;

    @ApiProperty({
        description: 'Number of views',
        example: 150
    })
    viewCount: number;

    @ApiProperty({
        description: 'Number of applications',
        example: 25
    })
    applicationCount: number;

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
 * DTO for creating a new job offer
 */
export class CreateJobOfferDto {
    @ApiProperty({
        description: 'Job title',
        example: 'Senior Frontend Developer',
        maxLength: 200
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Job description',
        example: 'We are looking for an experienced frontend developer to join our dynamic team...'
    })
    @IsString()
    description: string;

    @ApiPropertyOptional({
        description: 'Job requirements',
        example: '5+ years of experience with React, TypeScript knowledge, Agile methodology experience',
        nullable: true
    })
    @IsOptional()
    @IsString()
    requirements?: string;

    @ApiPropertyOptional({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    activitySectorId?: string;

    @ApiPropertyOptional({
        description: 'Contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    contractTypeId?: string;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumEducationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumExperienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Minimum salary offered',
        example: 45000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maximum salary offered',
        example: 65000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMax?: number;

    @ApiPropertyOptional({
        description: 'Currency for salary',
        example: 'EUR',
        default: 'EUR'
    })
    @IsOptional()
    @IsString()
    salaryCurrency?: string;

    @ApiPropertyOptional({
        description: 'Benefits offered',
        example: 'Health insurance, meal vouchers, flexible working hours, remote work options'
    })
    @IsOptional()
    @IsString()
    benefits?: string;

    @ApiPropertyOptional({
        description: 'Whether remote work is possible',
        example: true,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isRemoteWork?: boolean;

    @ApiPropertyOptional({
        description: 'Whether job is disability-friendly',
        example: true,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isDisabilityFriendly?: boolean;

    @ApiPropertyOptional({
        description: 'Whether job is exclusive for disabled candidates',
        example: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isExclusiveForDisabled?: boolean;

    @ApiPropertyOptional({
        description: 'Array of disability type IDs that are suitable for this job offer',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsUUID(4, { each: true })
    suitableDisabilityTypeIds?: string[];

    @ApiPropertyOptional({
        description: 'Application deadline',
        example: '2024-12-31T23:59:59.000Z'
    })
    @IsOptional()
    applicationDeadline?: Date;
}

/**
 * DTO for updating a job offer
 */
export class UpdateJobOfferDto {
    @ApiPropertyOptional({
        description: 'Job title',
        example: 'Senior Frontend Developer',
        maxLength: 200
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Job description',
        example: 'We are looking for an experienced frontend developer to join our dynamic team...'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Job requirements',
        example: '5+ years of experience with React, TypeScript knowledge, Agile methodology experience',
        nullable: true
    })
    @IsOptional()
    @IsString()
    requirements?: string;

    @ApiPropertyOptional({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    activitySectorId?: string;

    @ApiPropertyOptional({
        description: 'Contract type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    contractTypeId?: string;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Minimum education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumEducationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Minimum experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    minimumExperienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Minimum salary offered',
        example: 45000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maximum salary offered',
        example: 65000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMax?: number;

    @ApiPropertyOptional({
        description: 'Currency for salary',
        example: 'EUR'
    })
    @IsOptional()
    @IsString()
    salaryCurrency?: string;

    @ApiPropertyOptional({
        description: 'Benefits offered',
        example: 'Health insurance, meal vouchers, flexible working hours, remote work options'
    })
    @IsOptional()
    @IsString()
    benefits?: string;

    @ApiPropertyOptional({
        description: 'Whether remote work is possible',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isRemoteWork?: boolean;

    @ApiPropertyOptional({
        description: 'Whether job is disability-friendly',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isDisabilityFriendly?: boolean;

    @ApiPropertyOptional({
        description: 'Whether job is exclusive for disabled candidates',
        example: false
    })
    @IsOptional()
    @IsBoolean()
    isExclusiveForDisabled?: boolean;

    @ApiPropertyOptional({
        description: 'Array of disability type IDs that are suitable for this job offer',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsUUID(4, { each: true })
    suitableDisabilityTypeIds?: string[];

    @ApiPropertyOptional({
        description: 'Application deadline',
        example: '2024-12-31T23:59:59.000Z'
    })
    @IsOptional()
    applicationDeadline?: Date;

    @ApiPropertyOptional({
        description: 'Whether job offer is visible to candidates',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;
}

/**
 * DTO for job offer statistics response
 */
export class JobOfferStatsDto {
    @ApiProperty({
        description: 'Job offer ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    jobOfferId: string;

    @ApiProperty({
        description: 'Total number of views',
        example: 150
    })
    totalViews: number;

    @ApiProperty({
        description: 'Total number of applications',
        example: 25
    })
    totalApplications: number;

    @ApiProperty({
        description: 'Number of views today',
        example: 5
    })
    viewsToday: number;

    @ApiProperty({
        description: 'Number of applications today',
        example: 2
    })
    applicationsToday: number;

    @ApiProperty({
        description: 'Number of views this week',
        example: 20
    })
    viewsThisWeek: number;

    @ApiProperty({
        description: 'Number of applications this week',
        example: 8
    })
    applicationsThisWeek: number;

    @ApiProperty({
        description: 'Publication date',
        example: '2024-01-01T00:00:00.000Z'
    })
    publishedAt: Date;

    @ApiProperty({
        description: 'Job offer status',
        enum: JobOfferStatus,
        example: JobOfferStatus.PUBLISHED
    })
    status: JobOfferStatus;
}

/**
 * DTO for paginated job offers response
 */
export class PagedJobOffersResponseDto {
    @ApiProperty({
        description: 'Array of job offers',
        type: [JobOfferResponseDto],
    })
    data: JobOfferResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 150,
            page: 1,
            size: 10,
            totalPages: 15,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 