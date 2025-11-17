import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
    @ApiProperty({
        description: 'The name of the permission',
        example: 'Create User',
    })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({
        description: 'Unique code identifier for the permission',
        example: 'users.create',
    })
    @IsString()
    @MinLength(2)
    code: string;

    @ApiProperty({
        description: 'Description of what the permission allows',
        example: 'Allows creating new users',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether this is a system permission',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    isSystem?: boolean;

    @ApiProperty({
        description: 'Whether this is a default permission',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @ApiPropertyOptional({ description: 'Whether the permission is active', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
} 