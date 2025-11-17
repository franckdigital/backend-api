import { IsString, IsOptional, IsBoolean, IsInt, IsUUID, IsEnum, IsNumber, Length, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * Enum for location types
 */
export enum LocationType {
    COUNTRY = 'country',
    REGION = 'region',
    CITY = 'city',
    DISTRICT = 'district'
}

/**
 * DTO for creating a new location
 */
export class CreateLocationDto {
    @ApiProperty({
        description: 'Name of the location',
        example: 'Dakar',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name: string;

    @ApiProperty({
        description: 'Unique code for the location',
        example: 'DKR',
        minLength: 2,
        maxLength: 20
    })
    @IsString()
    @Length(2, 20, { message: 'Code must be between 2 and 20 characters' })
    code: string;

    @ApiProperty({
        description: 'Type of location in the hierarchy',
        example: 'city',
        enum: LocationType,
        enumName: 'LocationType'
    })
    @IsEnum(LocationType, { message: 'Type must be one of: country, region, city, district' })
    type: LocationType;

    @ApiPropertyOptional({
        description: 'Description of the location',
        example: 'Capital city of Senegal'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Latitude coordinate',
        example: 14.7167,
        minimum: -90,
        maximum: 90
    })
    @IsOptional()
    @IsNumber({}, { message: 'Latitude must be a number' })
    @Min(-90, { message: 'Latitude must be between -90 and 90' })
    @Max(90, { message: 'Latitude must be between -90 and 90' })
    latitude?: number;

    @ApiPropertyOptional({
        description: 'Longitude coordinate',
        example: -17.4677,
        minimum: -180,
        maximum: 180
    })
    @IsOptional()
    @IsNumber({}, { message: 'Longitude must be a number' })
    @Min(-180, { message: 'Longitude must be between -180 and 180' })
    @Max(180, { message: 'Longitude must be between -180 and 180' })
    longitude?: number;

    @ApiPropertyOptional({
        description: 'Parent location ID (null for countries)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    @IsOptional()
    @IsUUID(4, { message: 'Parent ID must be a valid UUID' })
    parentId?: string;

    @ApiPropertyOptional({
        description: 'Whether the location is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying locations',
        example: 1,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Sort order must be a non-negative integer' })
    sortOrder?: number;
}

/**
 * DTO for updating an existing location
 */
export class UpdateLocationDto extends PartialType(CreateLocationDto) {
    @ApiPropertyOptional({
        description: 'Name of the location',
        example: 'Dakar Metropolitan Area',
        minLength: 2,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name?: string;

    @ApiPropertyOptional({
        description: 'Unique code for the location',
        example: 'DKR_METRO',
        minLength: 2,
        maxLength: 20
    })
    @IsOptional()
    @IsString()
    @Length(2, 20, { message: 'Code must be between 2 and 20 characters' })
    code?: string;

    @ApiPropertyOptional({
        description: 'Type of location in the hierarchy',
        example: 'district',
        enum: LocationType,
        enumName: 'LocationType'
    })
    @IsOptional()
    @IsEnum(LocationType, { message: 'Type must be one of: country, region, city, district' })
    type?: LocationType;

    @ApiPropertyOptional({
        description: 'Parent location ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID(4, { message: 'Parent ID must be a valid UUID' })
    parentId?: string;
}

/**
 * DTO for location response with nested children and parent
 */
export class LocationResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the location',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the location',
        example: 'Dakar'
    })
    name: string;

    @ApiProperty({
        description: 'Unique code for the location',
        example: 'DKR'
    })
    code: string;

    @ApiProperty({
        description: 'Type of location in the hierarchy',
        example: 'city',
        enum: LocationType
    })
    type: LocationType;

    @ApiProperty({
        description: 'Description of the location',
        example: 'Capital city of Senegal',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Latitude coordinate',
        example: 14.7167,
        nullable: true
    })
    latitude: number | null;

    @ApiProperty({
        description: 'Longitude coordinate',
        example: -17.4677,
        nullable: true
    })
    longitude: number | null;

    @ApiProperty({
        description: 'Parent location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    parentId: string | null;

    @ApiProperty({
        description: 'Parent location information',
        type: () => LocationResponseDto,
        nullable: true
    })
    parent: LocationResponseDto | null;

    @ApiProperty({
        description: 'Child locations',
        type: [LocationResponseDto],
        isArray: true
    })
    children: LocationResponseDto[];

    @ApiProperty({
        description: 'Whether the location is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying locations',
        example: 1
    })
    sortOrder: number;

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
 * DTO for simplified location response (without relations)
 */
export class SimpleLocationResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the location',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the location',
        example: 'Dakar'
    })
    name: string;

    @ApiProperty({
        description: 'Unique code for the location',
        example: 'DKR'
    })
    code: string;

    @ApiProperty({
        description: 'Type of location in the hierarchy',
        example: 'city',
        enum: LocationType
    })
    type: LocationType;

    @ApiProperty({
        description: 'Parent location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    parentId: string | null;

    @ApiProperty({
        description: 'Whether the location is active',
        example: true
    })
    isActive: boolean;
} 