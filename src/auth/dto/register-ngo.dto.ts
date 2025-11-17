import { IsString, IsEmail, IsOptional, IsUrl, IsArray, IsBoolean, IsDateString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterNgoDto {
  // User information
  @ApiProperty({ description: 'NGO representative first name', example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'NGO representative last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'NGO representative email', example: 'john.doe@hopeassociation.org' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Password (optional - will be generated if not provided)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
  
  @ApiPropertyOptional({ description: 'Password (optional - will be generated if not provided)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  confirmPassword?: string;

  @ApiPropertyOptional({ description: 'Representative contact number', example: '+237123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact?: string;

  @ApiPropertyOptional({ description: 'Representative secondary contact', example: '+237987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  secondaryContact?: string;

  @ApiPropertyOptional({ description: 'Representative gender', example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiPropertyOptional({ description: 'Representative birth date', example: '1980-01-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Representative address', example: '123 Main Street, Douala, Cameroon' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Representative profession', example: 'NGO Director' })
  @IsOptional()
  @IsString()
  profession?: string;

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

  // NGO information
  @ApiProperty({ description: 'NGO organization name', example: 'Hope for Disabled Association' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;

  @ApiPropertyOptional({ description: 'NGO registration number', example: 'NGO-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'NGO tax number', example: 'TAX-NGO-001' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'NGO mission statement' })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional({ description: 'NGO description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'NGO website URL', example: 'https://hope-disabled.org' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  // File upload
  @ApiPropertyOptional({
    description: 'NGO logo file',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  logoFile?: any;

  @ApiPropertyOptional({ description: 'Founded date', example: '2020-01-15' })
  @IsOptional()
  @IsDateString()
  foundedDate?: string;

  @ApiPropertyOptional({ description: 'Location ID where NGO is based' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Full address of NGO' })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({ description: 'Primary contact person name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Secondary contact person name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  secondaryContactName?: string;

  @ApiPropertyOptional({ description: 'Secondary contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  secondaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Secondary contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Array of activity sector IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  focusAreaIds?: string[];

  @ApiPropertyOptional({ description: 'Array of supported disability type IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  supportedDisabilityTypeIds?: string[];

  @ApiPropertyOptional({ description: 'Array of service area location IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  serviceAreaIds?: string[];

  @ApiPropertyOptional({ description: 'Services offered by NGO (JSON string)', example: '["Job Training", "Career Counseling"]' })
  @IsOptional()
  @IsString()
  servicesOffered?: string;

  @ApiPropertyOptional({ description: 'Provides job training', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  providesJobTraining?: boolean;

  @ApiPropertyOptional({ description: 'Provides career counseling', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  providesCareerCounseling?: boolean;

  @ApiPropertyOptional({ description: 'Provides legal support', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  providesLegalSupport?: boolean;

  @ApiPropertyOptional({ description: 'Provides healthcare support', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  providesHealthcareSupport?: boolean;

  @ApiPropertyOptional({ description: 'Number of active members' })
  @IsOptional()
  activeMembers?: number;

  @ApiPropertyOptional({ description: 'Number of staff' })
  @IsOptional()
  staffCount?: number;
} 