import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for permission name or code',
        example: 'user',
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'name',
    })
    @IsString()
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['asc', 'desc'],
        example: 'asc',
    })
    @IsEnum(['asc', 'desc'])
    @IsOptional()
    sortOrder?: 'asc' | 'desc';

    @ApiPropertyOptional({
        description: 'Filter by default status',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isDefault?: boolean;
}

export class PermissionPageQueryDto extends PermissionQueryDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    size?: number = 10;
} 