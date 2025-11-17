import { IsEmail, IsString, MinLength, IsOptional, IsDateString, IsNumber, IsBoolean, Min, Max, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserType } from '../../database/entities/user.entity';

export class RegisterCandidateDto {
    // User basic information
    @ApiProperty({
        description: 'Candidate first name',
        example: 'John',
        minLength: 2,
    })
    @IsString()
    @MinLength(2)
    firstName: string;

    @ApiProperty({
        description: 'Candidate last name',
        example: 'Doe',
        minLength: 2,
    })
    @IsString()
    @MinLength(2)
    lastName: string;

    @ApiProperty({
        description: 'Candidate email address',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        description: 'User password (optional - will be generated if not provided)',
        example: 'Password123',
        minLength: 6,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({
        description: 'Confirm password - must match password',
        example: 'Password123',
        minLength: 6,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    confirmPassword?: string;

    @ApiPropertyOptional({
        description: 'Primary contact number',
        example: '+237123456789',
    })
    @IsOptional()
    @IsString()
    contact?: string;

    @ApiPropertyOptional({
        description: 'Secondary contact number',
        example: '+237987654321',
    })
    @IsOptional()
    @IsString()
    secondaryContact?: string;

    @ApiPropertyOptional({
        description: 'Gender',
        example: 'male',
    })
    @IsOptional()
    @IsString()
    sex?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-15',
    })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({
        description: 'Home address',
        example: '123 Main Street, Douala, Cameroon',
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Current profession ID',
        example: 'uuid-profession-id',
    })
    @IsOptional()
    @IsUUID()
    professionId?: string;

    @ApiPropertyOptional({
        description: 'Array of role IDs assigned to the user',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001']
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        }
        return Array.isArray(value) ? value : [];
    })
    roles?: string[];

    // File uploads
    @ApiPropertyOptional({
        description: 'Profile photo file',
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    profilePhoto?: any;

    @ApiPropertyOptional({
        description: 'CV file upload',
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    cvFile?: any;

    @ApiPropertyOptional({
        description: 'Video presentation file',
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    videoFile?: any;

    // Candidate-specific disability information
    @ApiProperty({
        description: 'Disability type ID',
        example: 'uuid-disability-type-id',
    })
    @IsUUID()
    disabilityTypeId: string;

    @ApiPropertyOptional({
        description: 'Detailed description of the disability',
        example: 'Mobility impairment affecting lower limbs',
    })
    @IsOptional()
    @IsString()
    disabilityDescription?: string;

    // Professional information
    @ApiPropertyOptional({
        description: 'Education level ID',
        example: 'uuid-education-level-id',
    })
    @IsOptional()
    @IsUUID()
    educationLevelId?: string;

    @ApiPropertyOptional({
        description: 'Experience level ID',
        example: 'uuid-experience-level-id',
    })
    @IsOptional()
    @IsUUID()
    experienceLevelId?: string;

    @ApiPropertyOptional({
        description: 'Professional summary',
        example: 'Experienced software developer with expertise in web technologies',
    })
    @IsOptional()
    @IsString()
    professionalSummary?: string;

    // @ApiPropertyOptional({
    //     description: 'Skills (JSON string)',
    //     example: '["JavaScript", "TypeScript", "React", "Node.js"]',
    // })
    // @IsOptional()
    // @IsString()
    // skills?: string;

    // @ApiPropertyOptional({
    //     description: 'Languages spoken (JSON string)',
    //     example: '[{"name": "English", "level": "Native"}, {"name": "French", "level": "Fluent"}]',
    // })
    // @IsOptional()
    // @IsString()
    // languages?: string;

    // Location information
    // @ApiPropertyOptional({
    //     description: 'Location ID',
    //     example: 'uuid-location-id',
    // })
    // @IsOptional()
    // @IsUUID()
    // locationId?: string;

    @ApiPropertyOptional({
        description: 'Biography',
        example: 'Passionate about technology and helping others through accessible solutions.',
    })
    @IsOptional()
    @IsString()
    biography?: string;

    // @ApiPropertyOptional({
    //     description: 'Video presentation URL or description',
    //     example: 'Short video introducing myself and my skills',
    // })
    // @IsOptional()
    // @IsString()
    // videoPresentation?: string;

    @ApiPropertyOptional({
        description: 'Expected minimum salary',
        example: 500000,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    expectedSalaryMin?: number;

    @ApiPropertyOptional({
        description: 'Expected maximum salary',
        example: 750000,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    expectedSalaryMax?: number;

    @ApiPropertyOptional({
        description: 'Current availability status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isAvailable?: boolean;

    @ApiPropertyOptional({
        description: 'Availability date',
        example: '2024-02-01',
    })
    @IsOptional()
    @IsDateString()
    availabilityDate?: string;
} 