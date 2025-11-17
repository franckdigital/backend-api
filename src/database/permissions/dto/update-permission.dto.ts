import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
    @ApiPropertyOptional({
        description: 'The name of the permission',
        example: 'Create User',
    })
    @IsString()
    @MinLength(2)
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        description: 'Unique code identifier for the permission',
        example: 'users.create',
    })
    @IsString()
    @MinLength(2)
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({
        description: 'Description of what the permission allows',
        example: 'Allows creating new users',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether this is a default permission',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @ApiPropertyOptional({
        description: 'Whether this is permission is active or not',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
} 