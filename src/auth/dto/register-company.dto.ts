import { IsString, IsEmail, IsOptional, IsUrl, IsUUID, IsInt, IsNumber, Min, Max, MinLength, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterCompanyDto {
    // User information (company representative)
    @ApiProperty({
        description: 'Company representative first name',
        example: 'Jean',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({
        description: 'Company representative last name',
        example: 'Dupont',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;

    @ApiProperty({
        description: 'Company representative email',
        example: 'jean.dupont@techsolutions.com'
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        description: 'Password (optional - will be generated if not provided)',
        minLength: 8
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional({
        description: 'Password (optional - will be generated if not provided)',
        minLength: 8
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    confirmPassword?: string;

    @ApiPropertyOptional({
        description: 'Representative contact number',
        example: '+237123456789',
        maxLength: 20
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    contact?: string;

    @ApiPropertyOptional({
        description: 'Representative secondary contact',
        example: '+237987654321',
        maxLength: 20
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    secondaryContact?: string;

    @ApiPropertyOptional({
        description: 'Representative gender',
        example: 'male',
        enum: ['male', 'female', 'other']
    })
    @IsOptional()
    @IsString()
    sex?: string;

    @ApiPropertyOptional({
        description: 'Representative birth date',
        example: '1980-01-15'
    })
    @IsOptional()
    @IsString()
    birthDate?: string;

    @ApiPropertyOptional({
        description: 'Representative address',
        example: '123 Main Street, Douala, Cameroon'
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Representative profession',
        example: 'CEO'
    })
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

    // Company information
    @ApiProperty({
        description: 'Company name',
        example: 'Tech Solutions SARL',
        minLength: 2,
        maxLength: 255
    })
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    companyName: string;

    @ApiPropertyOptional({
        description: 'Company registration number (RCCM, SIRET, etc.)',
        example: 'RCCM123456789',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    registrationNumber?: string;

    @ApiPropertyOptional({
        description: 'Tax identification number',
        example: 'TAX987654321',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    taxNumber?: string;

    @ApiPropertyOptional({
        description: 'Company description'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Company website URL',
        example: 'https://www.techsolutions.com',
        maxLength: 500
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    website?: string;

    // File upload
    @ApiPropertyOptional({
        description: 'Company logo file',
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    logoFile?: any;

    @ApiProperty({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4)
    activitySectorId: string;

    @ApiProperty({
        description: 'Company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4)
    companySizeId: string;

    @ApiPropertyOptional({
        description: 'Exact number of employees',
        example: 150,
        minimum: 1,
        maximum: 1000000
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1000000)
    @Transform(({ value }) => parseInt(value))
    exactEmployeeCount?: number;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Full company address',
        example: '123 Business Avenue, Tech District, City, Country'
    })
    @IsOptional()
    @IsString()
    fullAddress?: string;

    @ApiPropertyOptional({
        description: 'Current number of disabled employees',
        example: 5,
        minimum: 0,
        maximum: 10000,
        default: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10000)
    @Transform(({ value }) => parseInt(value))
    currentDisabledEmployeesCount?: number;

    @ApiPropertyOptional({
        description: 'HR contact person name',
        example: 'Marie Martin',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    hrContactName?: string;

    @ApiPropertyOptional({
        description: 'HR contact email',
        example: 'rh@techsolutions.com',
        maxLength: 255
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    hrContactEmail?: string;

    @ApiPropertyOptional({
        description: 'HR contact phone number',
        example: '+237123456789',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    hrContactPhone?: string;
} 