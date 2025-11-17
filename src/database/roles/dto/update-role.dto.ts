import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsOptional, MinLength, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'The name of the role',
    example: 'Administrateur',
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique code identifier for the role',
    example: 'admin',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Description of what the role does',
    example: 'Administrateur de la coopérative',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a system role',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({
    description: 'List of permission IDs to assign to this role',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Whether this is the default role for new users',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 