import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsDateString, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../database/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    description: 'User email address (unique)',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Primary contact number',
    example: '+237123456789',
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({
    description: 'Secondary contact number',
    example: '+237987654321',
  })
  @IsOptional()
  @IsString()
  secondaryContact?: string;

  @ApiPropertyOptional({
    description: 'User gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['male', 'female', 'other'])
  sex?: string;

  @ApiPropertyOptional({
    description: 'User birth date (YYYY-MM-DD)',
    example: '1990-01-15',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'User full address',
    example: '123 Main Street, Douala, Cameroon',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'User profession or job title',
    example: 'Software Developer',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    description: 'Type of user account',
    example: 'candidate',
    enum: UserType,
    default: UserType.CANDIDATE,
  })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional({
    description: 'User password (optional - will be generated if not provided)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
} 