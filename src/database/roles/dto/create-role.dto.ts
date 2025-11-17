import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'Membre',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Unique code identifier for the role',
    example: 'membre',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Description of what the role does',
    example: 'Rôle de base pour les membres de la coopérative',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of permission IDs to assign to this role',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Whether this is the default role for new users',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 