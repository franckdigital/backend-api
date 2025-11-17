import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, Min, Max, IsDecimal, IsUrl, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for candidate pagination query parameters
 */
export class CandidatePageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in candidate name, professional summary, skills, or biography',
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
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by profile completion status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isProfileComplete?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by availability status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isAvailable?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by disability type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    disabilityTypeId?: string;

    @ApiPropertyOptional({
        description: 'Filter by disability type ID (alternative to disabilityTypeId)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    handicap?: string;

    @ApiPropertyOptional({
        description: 'Filter by education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    educationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    experienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Filter by profession ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    professionId?: string;

    @ApiPropertyOptional({
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;
}

/**
 * DTO for creating a new candidate profile
 */
export class CreateCandidateDto {
    @ApiProperty({
        description: 'Disability type ID (required)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID(4)
    disabilityTypeId: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the disability',
        example: 'Mobility impairment affecting lower limbs, uses wheelchair for mobility',
        maxLength: 1000
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    disabilityDescription?: string;

    @ApiPropertyOptional({
        description: 'Education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    educationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    experienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Profession ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    professionId?: string;

    @ApiPropertyOptional({
        description: 'Professional summary highlighting key qualifications and experience',
        example: 'Experienced software developer with 5+ years in web development, specializing in accessible applications',
        maxLength: 2000
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    professionalSummary?: string;

    @ApiPropertyOptional({
        description: 'Skills and competencies (JSON string array)',
        example: '["JavaScript", "TypeScript", "React", "Node.js", "Accessibility Testing", "WCAG Guidelines"]'
    })
    @IsOptional()
    @IsString()
    skills?: string;

    @ApiPropertyOptional({
        description: 'Languages spoken with proficiency levels (JSON string)',
        example: '["French (Native)", "English (Fluent)", "Spanish (Intermediate)"]'
    })
    @IsOptional()
    @IsString()
    languages?: string;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'URL to uploaded CV file',
        example: 'https://storage.example.com/cvs/candidate-cv.pdf'
    })
    @IsOptional()
    @IsUrl()
    cvFileUrl?: string;

    @ApiPropertyOptional({
        description: 'URL to profile photo',
        example: 'https://storage.example.com/photos/candidate-photo.jpg'
    })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({
        description: 'URL to video presentation',
        example: 'https://storage.example.com/videos/candidate-presentation.mp4'
    })
    @IsOptional()
    @IsUrl()
    videoPresentation?: string;

    @ApiPropertyOptional({
        description: 'Personal biography and background story',
        example: 'Passionate about creating inclusive technology solutions that make a difference...',
        maxLength: 3000
    })
    @IsOptional()
    @IsString()
    @MaxLength(3000)
    biography?: string;

    @ApiPropertyOptional({
        description: 'Minimum expected salary (in local currency)',
        example: 450000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    expectedSalaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maximum expected salary (in local currency)',
        example: 650000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    expectedSalaryMax?: number;

    @ApiPropertyOptional({
        description: 'Whether candidate is available for work',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean = true;

    @ApiPropertyOptional({
        description: 'Date when candidate will be available to start work',
        example: '2024-02-01'
    })
    @IsOptional()
    @IsDateString()
    availabilityDate?: string;
}

/**
 * DTO for updating candidate profile
 */
export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
    @ApiPropertyOptional({
        description: 'Whether candidate profile is active',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

/**
 * DTO for user information in candidate response
 */
export class UserResponseDto {
    @ApiProperty({
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'First name',
        example: 'John'
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name',
        example: 'Doe'
    })
    lastName: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiPropertyOptional({
        description: 'Primary contact number',
        example: '+237123456789'
    })
    contact?: string;

    @ApiPropertyOptional({
        description: 'Secondary contact number',
        example: '+237987654321'
    })
    secondaryContact?: string;

    @ApiPropertyOptional({
        description: 'Gender',
        example: 'male'
    })
    sex?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-15'
    })
    birthDate?: Date;

    @ApiPropertyOptional({
        description: 'Physical address',
        example: '123 Main Street, Douala, Cameroon'
    })
    address?: string;

    @ApiPropertyOptional({
        description: 'Profession or job title',
        example: 'Software Developer'
    })
    profession?: string;

    @ApiPropertyOptional({
        description: 'Profile photo URL',
        example: 'https://storage.example.com/photos/user-photo.jpg'
    })
    photoUrl?: string;

    @ApiProperty({
        description: 'Whether user account is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Whether email is verified',
        example: true
    })
    isEmailVerified: boolean;

    @ApiProperty({
        description: 'Account creation date',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;
}

/**
 * DTO for disability type information
 */
export class DisabilityTypeResponseDto {
    @ApiProperty({
        description: 'Disability type unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Disability type name',
        example: 'Mobility Impairment'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Disability type description',
        example: 'Conditions affecting movement and mobility'
    })
    description?: string;
}

/**
 * DTO for education level information
 */
export class EducationLevelResponseDto {
    @ApiProperty({
        description: 'Education level unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Education level name',
        example: 'Bachelor\'s Degree'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Education level description',
        example: 'Undergraduate degree program'
    })
    description?: string;
}

/**
 * DTO for experience level information
 */
export class ExperienceLevelResponseDto {
    @ApiProperty({
        description: 'Experience level unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Experience level name',
        example: 'Mid-Level (3-5 years)'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Experience level description',
        example: 'Professional with moderate experience'
    })
    description?: string;
}

/**
 * DTO for profession information
 */
export class ProfessionResponseDto {
    @ApiProperty({
        description: 'Profession unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Profession name',
        example: 'Software Developer'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Profession description',
        example: 'Professional who designs, develops, and maintains software applications'
    })
    description?: string;
}

/**
 * DTO for location information
 */
export class LocationResponseDto {
    @ApiProperty({
        description: 'Location unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Location name',
        example: 'Douala, Littoral'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Location type (city, region, etc.)',
        example: 'city'
    })
    type?: string;

    @ApiPropertyOptional({
        description: 'Parent location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    parentId?: string;
}

/**
 * Enhanced DTO for candidate response with complete related data
 */
export class CandidateResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the candidate',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'User ID associated with the candidate',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    userId: string;

    @ApiPropertyOptional({
        description: 'Complete user information',
        type: UserResponseDto
    })
    user?: UserResponseDto;

    @ApiProperty({
        description: 'Disability type ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    disabilityTypeId: string;

    @ApiPropertyOptional({
        description: 'Complete disability type information',
        type: DisabilityTypeResponseDto
    })
    disabilityType?: DisabilityTypeResponseDto;

    @ApiPropertyOptional({
        description: 'Detailed description of the disability',
        example: 'Mobility impairment affecting lower limbs, uses wheelchair for mobility'
    })
    disabilityDescription?: string;

    @ApiPropertyOptional({
        description: 'Education level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    educationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Complete education level information',
        type: EducationLevelResponseDto
    })
    educationLevel?: EducationLevelResponseDto;

    @ApiPropertyOptional({
        description: 'Experience level ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    experienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Complete experience level information',
        type: ExperienceLevelResponseDto
    })
    experienceLevel?: ExperienceLevelResponseDto;

    @ApiPropertyOptional({
        description: 'Profession ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    professionId?: string;

    @ApiPropertyOptional({
        description: 'Complete profession information',
        type: ProfessionResponseDto
    })
    profession?: ProfessionResponseDto;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    locationId?: string | null;

    @ApiPropertyOptional({
        description: 'Complete location information',
        type: LocationResponseDto
    })
    location?: LocationResponseDto | null;

    @ApiPropertyOptional({
        description: 'Professional summary highlighting key qualifications',
        example: 'Experienced software developer with expertise in accessible web applications and 5+ years of professional experience'
    })
    professionalSummary?: string;

    @ApiPropertyOptional({
        description: 'Skills and competencies (JSON string)',
        example: '["JavaScript", "TypeScript", "React", "Node.js", "Accessibility Testing"]'
    })
    skills?: string;

    @ApiPropertyOptional({
        description: 'Languages spoken with proficiency levels (JSON string)',
        example: '["French (Native)", "English (Fluent)", "Spanish (Intermediate)"]'
    })
    languages?: string;

    @ApiPropertyOptional({
        description: 'Personal biography and background',
        example: 'Passionate about creating inclusive technology solutions that make a difference in people\'s lives...'
    })
    biography?: string;

    @ApiPropertyOptional({
        description: 'Profile photo URL',
        example: 'https://storage.example.com/photos/candidate-photo.jpg'
    })
    photoUrl?: string;

    @ApiPropertyOptional({
        description: 'CV file URL',
        example: 'https://storage.example.com/cvs/candidate-cv.pdf'
    })
    cvFileUrl?: string;

    @ApiPropertyOptional({
        description: 'Video presentation URL',
        example: 'https://storage.example.com/videos/candidate-video.mp4'
    })
    videoPresentation?: string;

    @ApiPropertyOptional({
        description: 'Minimum expected salary',
        example: 450000
    })
    expectedSalaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maximum expected salary',
        example: 650000
    })
    expectedSalaryMax?: number;

    @ApiProperty({
        description: 'Whether candidate is available for work',
        example: true
    })
    isAvailable: boolean;

    @ApiPropertyOptional({
        description: 'Date when candidate will be available',
        example: '2024-02-01T00:00:00.000Z'
    })
    availabilityDate?: Date;

    @ApiProperty({
        description: 'Profile completion percentage (0-100)',
        example: 85,
        minimum: 0,
        maximum: 100
    })
    profileCompletionPercentage: number;

    @ApiProperty({
        description: 'Whether profile is considered complete (≥80%)',
        example: true
    })
    isProfileComplete: boolean;

    @ApiProperty({
        description: 'Whether candidate profile is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Profile creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last profile update timestamp',
        example: '2024-01-15T12:30:00.000Z'
    })
    updatedAt: Date;
}

/**
 * DTO for paginated candidates response
 */
export class PagedCandidatesResponseDto {
    @ApiProperty({
        description: 'Array of candidates with complete information',
        type: [CandidateResponseDto],
    })
    data: CandidateResponseDto[];

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

/**
 * DTO for candidate profile statistics
 */
export class CandidateStatsDto {
    @ApiProperty({
        description: 'Total number of candidates',
        example: 150
    })
    totalCandidates: number;

    @ApiProperty({
        description: 'Number of active candidates',
        example: 142
    })
    activeCandidates: number;

    @ApiProperty({
        description: 'Number of candidates with complete profiles',
        example: 98
    })
    completedProfiles: number;

    @ApiProperty({
        description: 'Number of available candidates',
        example: 87
    })
    availableCandidates: number;

    @ApiProperty({
        description: 'Number of candidates with uploaded CVs',
        example: 112
    })
    candidatesWithCv: number;

    @ApiProperty({
        description: 'Number of candidates with video presentations',
        example: 45
    })
    candidatesWithVideo: number;

    @ApiProperty({
        description: 'Average profile completion percentage',
        example: 73.5
    })
    averageCompletionRate: number;
}

/**
 * DTO for bulk operations response
 */
export class BulkOperationResponseDto {
    @ApiProperty({
        description: 'Number of successfully processed items',
        example: 15
    })
    successCount: number;

    @ApiProperty({
        description: 'Number of failed operations',
        example: 2
    })
    failureCount: number;

    @ApiProperty({
        description: 'Array of error messages for failed operations',
        example: ['Invalid disability type ID for candidate John Doe', 'Missing required field for candidate Jane Smith']
    })
    errors: string[];

    @ApiProperty({
        description: 'Total number of items processed',
        example: 17
    })
    totalProcessed: number;
} 