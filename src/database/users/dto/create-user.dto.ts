import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, MinLength, IsDate, IsDateString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'The contact number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({
    description: 'The secondary contact number of the user',
    example: '+1234567891',
  })
  @IsOptional()
  @IsString()
  secondaryContact?: string;

  @ApiPropertyOptional({
    description: 'The sex of the user',
    example: 'Male',
  })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiPropertyOptional({
    description: 'The birth date of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'The address of the user',
    example: '123 Main St, City, Country',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'The profession of the user',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    description: 'The password of the user',
    example: 'strongPassword123',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Array of role UUIDs',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Array of permission UUIDs',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
} 