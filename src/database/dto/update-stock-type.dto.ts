import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateStockTypeDto } from './create-stock-type.dto';

export class UpdateStockTypeDto extends PartialType(CreateStockTypeDto) {
    @ApiProperty({
        description: 'Whether the stock type is active',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
} 