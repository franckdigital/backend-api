import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class PermissionsDto {
  @ApiProperty({
    description: 'List of permission codes (not IDs)',
    example: ['roles:read', 'users:create', 'permissions:update'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
} 