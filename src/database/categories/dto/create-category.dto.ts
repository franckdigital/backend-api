import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Name of the category (in French)',
        example: 'Électronique',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Name of the category (in English)',
        example: 'Electronics',
    })
    @IsString()
    nameEn: string;

    @ApiPropertyOptional({
        description: 'Description of the category (in French)',
        example: 'Appareils électroniques et accessoires',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Description of the category (in English)',
        example: 'Electronic devices and accessories',
    })
    @IsString()
    @IsOptional()
    descriptionEn?: string;

    @ApiPropertyOptional({
        description: 'Whether the category is active',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Order of the category (for display purposes)',
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({
        description: 'URL to the category image',
    })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({
        description: 'Additional metadata for the category',
        example: { featured: true, color: '#FF5733' },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
} 