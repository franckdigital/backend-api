import { IsString, IsOptional, IsBoolean, IsInt, IsUUID, IsUrl, IsEmail, Length, Min, Max, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new company
 */
export class CreateCompanyDto {
    @ApiProperty({
        description: 'Company name',
        example: 'Tech Solutions Inc.',
        minLength: 2,
        maxLength: 255
    })
    @IsString()
    @Length(2, 255, { message: 'Company name must be between 2 and 255 characters' })
    companyName: string;

    @ApiPropertyOptional({
        description: 'Company registration number (RCCM, SIRET, etc.)',
        example: 'RCCM123456789',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: 'Registration number must not exceed 255 characters' })
    registrationNumber?: string;

    @ApiPropertyOptional({
        description: 'Tax identification number',
        example: 'TAX987654321',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: 'Tax number must not exceed 255 characters' })
    taxNumber?: string;

    @ApiPropertyOptional({
        description: 'Company description',
        example: 'Leading technology solutions provider specializing in accessible software development'
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
    @IsUrl({}, { message: 'Website must be a valid URL' })
    @Length(1, 500, { message: 'Website URL must not exceed 500 characters' })
    website?: string;

    @ApiPropertyOptional({
        description: 'Company logo URL',
        example: 'https://www.techsolutions.com/logo.png',
        maxLength: 255
    })
    @IsOptional()
    @IsUrl({}, { message: 'Logo URL must be a valid URL' })
    @Length(1, 255, { message: 'Logo URL must not exceed 255 characters' })
    logoUrl?: string;

    @ApiProperty({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4, { message: 'Activity sector ID must be a valid UUID' })
    activitySectorId: string;

    @ApiProperty({
        description: 'Company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4, { message: 'Company size ID must be a valid UUID' })
    companySizeId: string;

    @ApiPropertyOptional({
        description: 'Exact number of employees',
        example: 150,
        minimum: 1,
        maximum: 1000000
    })
    @IsOptional()
    @IsInt()
    @Min(1, { message: 'Employee count must be at least 1' })
    @Max(1000000, { message: 'Employee count seems unrealistic' })
    exactEmployeeCount?: number;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4, { message: 'Location ID must be a valid UUID' })
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
    @Min(0, { message: 'Disabled employees count cannot be negative' })
    @Max(10000, { message: 'Disabled employees count seems unrealistic' })
    currentDisabledEmployeesCount?: number;

    @ApiPropertyOptional({
        description: 'HR contact person name',
        example: 'Jane Doe',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: 'HR contact name must not exceed 255 characters' })
    hrContactName?: string;

    @ApiPropertyOptional({
        description: 'HR contact email',
        example: 'hr@techsolutions.com',
        maxLength: 255
    })
    @IsOptional()
    @IsEmail({}, { message: 'HR contact email must be a valid email address' })
    @Length(1, 255, { message: 'HR contact email must not exceed 255 characters' })
    hrContactEmail?: string;

    @ApiPropertyOptional({
        description: 'HR contact phone number',
        example: '+1234567890',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @Length(1, 50, { message: 'HR contact phone must not exceed 50 characters' })
    hrContactPhone?: string;
}

/**
 * DTO for updating an existing company
 */
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
    @ApiPropertyOptional({
        description: 'Company name',
        example: 'Tech Solutions International Inc.',
        minLength: 2,
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @Length(2, 255, { message: 'Company name must be between 2 and 255 characters' })
    companyName?: string;

    @ApiPropertyOptional({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4, { message: 'Activity sector ID must be a valid UUID' })
    activitySectorId?: string;

    @ApiPropertyOptional({
        description: 'Company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4, { message: 'Company size ID must be a valid UUID' })
    companySizeId?: string;

    @ApiPropertyOptional({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4, { message: 'Location ID must be a valid UUID' })
    locationId?: string;
}

/**
 * DTO for company response
 */
export class CompanyResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the company',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'User ID associated with the company',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    userId: string;

    @ApiProperty({
        description: 'Company name',
        example: 'Tech Solutions Inc.'
    })
    companyName: string;

    @ApiProperty({
        description: 'Company registration number',
        example: 'RCCM123456789',
        nullable: true
    })
    registrationNumber: string | null;

    @ApiProperty({
        description: 'Tax identification number',
        example: 'TAX987654321',
        nullable: true
    })
    taxNumber: string | null;

    @ApiProperty({
        description: 'Company description',
        example: 'Leading technology solutions provider',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Company website URL',
        example: 'https://www.techsolutions.com',
        nullable: true
    })
    website: string | null;

    @ApiProperty({
        description: 'Company logo URL',
        example: 'https://www.techsolutions.com/logo.png',
        nullable: true
    })
    logoUrl: string | null;

    @ApiProperty({
        description: 'Activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    activitySectorId: string;

    @ApiProperty({
        description: 'Company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    companySizeId: string;

    @ApiProperty({
        description: 'Exact number of employees',
        example: 150,
        nullable: true
    })
    exactEmployeeCount: number | null;

    @ApiProperty({
        description: 'Location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    locationId: string | null;

    @ApiProperty({
        description: 'Full company address',
        example: '123 Business Avenue, Tech District',
        nullable: true
    })
    fullAddress: string | null;

    @ApiProperty({
        description: 'Whether company is subject to disability quota',
        example: true
    })
    isSubjectToDisabilityQuota: boolean;

    @ApiProperty({
        description: 'Current number of disabled employees',
        example: 5
    })
    currentDisabledEmployeesCount: number;

    @ApiProperty({
        description: 'Required number of disabled employees',
        example: 3
    })
    requiredDisabledEmployeesCount: number;

    @ApiProperty({
        description: 'Current compliance percentage',
        example: 2.5
    })
    currentCompliancePercentage: number;

    @ApiProperty({
        description: 'Whether company is compliant with law',
        example: true
    })
    isCompliantWithLaw: boolean;

    @ApiProperty({
        description: 'Last compliance check date',
        example: '2024-01-01T00:00:00.000Z',
        nullable: true
    })
    lastComplianceCheckDate: Date | null;

    @ApiProperty({
        description: 'HR contact person name',
        example: 'Jane Doe',
        nullable: true
    })
    hrContactName: string | null;

    @ApiProperty({
        description: 'HR contact email',
        example: 'hr@techsolutions.com',
        nullable: true
    })
    hrContactEmail: string | null;

    @ApiProperty({
        description: 'HR contact phone',
        example: '+1234567890',
        nullable: true
    })
    hrContactPhone: string | null;

    @ApiProperty({
        description: 'Whether company is verified',
        example: true
    })
    isVerified: boolean;

    @ApiProperty({
        description: 'Verification date',
        example: '2024-01-01T00:00:00.000Z',
        nullable: true
    })
    verificationDate: Date | null;

    @ApiProperty({
        description: 'Whether company is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Whether company can post job offers',
        example: true
    })
    canPostJobOffers: boolean;

    @ApiProperty({
        description: 'Profile completion percentage',
        example: 85
    })
    profileCompletionPercentage: number;

    @ApiProperty({
        description: 'Whether profile is complete',
        example: false
    })
    isProfileComplete: boolean;

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
 * DTO for paginated companies query
 */
export class CompanyPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in company name, description, registration number, or tax number',
        example: 'tech solutions'
    })
    @IsOptional()
    @IsString()
    declare search?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') return undefined;
        return value === 'true' || value === true;
    })
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by verification status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') return undefined;
        return value === 'true' || value === true;
    })
    isVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by compliance status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') return undefined;
        return value === 'true' || value === true;
    })
    isCompliantWithLaw?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by disability quota subject status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') return undefined;
        return value === 'true' || value === true;
    })
    isSubjectToDisabilityQuota?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by activity sector ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    activitySectorId?: string;

    @ApiPropertyOptional({
        description: 'Filter by company size ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    companySizeId?: string;

    @ApiPropertyOptional({
        description: 'Filter by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4)
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Filter by minimum employee count',
        example: 50,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    minEmployeeCount?: number;

    @ApiPropertyOptional({
        description: 'Filter by maximum employee count',
        example: 500,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    maxEmployeeCount?: number;
}

/**
 * DTO for paginated companies response
 */
export class PagedCompaniesResponseDto {
    @ApiProperty({
        description: 'Array of companies',
        type: [CompanyResponseDto],
    })
    data: CompanyResponseDto[];

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