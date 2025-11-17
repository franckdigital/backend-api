import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockTypeDto {
    @ApiProperty({
        description: 'The designation of the stock type',
        example: 'Actions ordinaires',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    designation: string;

    @ApiProperty({
        description: 'The English designation of the stock type',
        example: 'Common Shares',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    designationEn: string;

    @ApiProperty({
        description: 'Description of the stock type',
        example: 'Description détaillée du type d\'action',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'English description of the stock type',
        example: 'Detailed description of the stock type',
        required: false,
    })
    @IsOptional()
    @IsString()
    descriptionEn?: string;
} 