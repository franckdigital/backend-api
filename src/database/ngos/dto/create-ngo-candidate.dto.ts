import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsDateString, MinLength, MaxLength, IsPhoneNumber, IsDecimal, IsJSON, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateNgoCandidateDto {
  // User basic information
  @ApiProperty({ description: 'Candidate first name', example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Candidate last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'Candidate email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Password (optional - will be generated if not provided)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ description: 'Primary contact number', example: '+237123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact?: string;

  @ApiPropertyOptional({ description: 'Secondary contact number', example: '+237987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  secondaryContact?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiPropertyOptional({ description: 'Birth date', example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Full address', example: '123 Main Street, Douala, Cameroon' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Profession', example: 'Software Developer' })
  @IsOptional()
  @IsString()
  profession?: string;

  // Candidate-specific disability information
  @ApiProperty({ description: 'Disability type ID', example: 'uuid-disability-type-id' })
  @IsUUID()
  disabilityTypeId: string;

  @ApiPropertyOptional({ description: 'Disability description', example: 'Mobility impairment affecting lower limbs' })
  @IsOptional()
  @IsString()
  disabilityDescription?: string;

  // Professional information
  @ApiPropertyOptional({ description: 'Education level ID', example: 'uuid-education-level-id' })
  @IsOptional()
  @IsUUID()
  educationLevelId?: string;

  @ApiPropertyOptional({ description: 'Experience level ID', example: 'uuid-experience-level-id' })
  @IsOptional()
  @IsUUID()
  experienceLevelId?: string;

  @ApiPropertyOptional({ description: 'Profession ID', example: 'uuid-profession-id' })
  @IsOptional()
  @IsUUID()
  professionId?: string;

  @ApiPropertyOptional({ description: 'Professional summary', example: 'Experienced software developer with expertise in web technologies' })
  @IsOptional()
  @IsString()
  professionalSummary?: string;

  @ApiPropertyOptional({ description: 'Skills (JSON array)', example: '["JavaScript", "TypeScript", "React", "Node.js"]' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: 'Languages (JSON array)', example: '[{"name": "English", "level": "Native"}, {"name": "French", "level": "Fluent"}]' })
  @IsOptional()
  @IsString()
  languages?: string;

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

  // Location and preferences
  @ApiPropertyOptional({ description: 'Location ID', example: 'uuid-location-id' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Biography', example: 'Passionate about technology and helping others through accessible solutions.' })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({ description: 'Video presentation description', example: 'Short video introducing myself and my skills' })
  @IsOptional()
  @IsString()
  videoPresentation?: string;

  @ApiPropertyOptional({ description: 'Expected salary minimum', example: 500000 })
  @IsOptional()
  @IsDecimal()
  expectedSalaryMin?: number;

  @ApiPropertyOptional({ description: 'Expected salary maximum', example: 750000 })
  @IsOptional()
  @IsDecimal()
  expectedSalaryMax?: number;

  @ApiPropertyOptional({ description: 'Is candidate available for work', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Availability date', example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;
} 