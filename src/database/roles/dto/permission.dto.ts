import { IsArray, IsNotEmpty } from 'class-validator';
import { Permission } from '../../entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class PermissionDto {
  @IsArray()
  @IsNotEmpty()
  permissions: Permission[];
} 