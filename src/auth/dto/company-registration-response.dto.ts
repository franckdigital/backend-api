import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../database/users/dto/user-response.dto';
import { CompanyResponseDto } from '../../database/companies/companies.dto';

export class CompanyRegistrationResponseDto {
  @ApiProperty({ 
    description: 'Registration success status',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'User account information', 
    type: UserResponseDto 
  })
  user: UserResponseDto;

  @ApiProperty({ 
    description: 'Company profile information', 
    type: CompanyResponseDto 
  })
  company: CompanyResponseDto;

  @ApiPropertyOptional({ 
    description: 'Generated password (if not provided)',
    example: 'GeneratedP@ssw0rd123'
  })
  generatedPassword?: string;

  @ApiProperty({ 
    description: 'Registration completion message',
    example: 'Company registration successful. Your account is pending verification by administrators.'
  })
  message: string;

  @ApiProperty({ 
    description: 'Whether the company account requires admin verification',
    example: true
  })
  requiresVerification: boolean;

  @ApiProperty({ 
    description: 'Whether email verification is required',
    example: true
  })
  isEmailVerificationRequired: boolean;

  @ApiProperty({ 
    description: 'Whether the company can post job offers immediately',
    example: false
  })
  canPostJobOffers: boolean;
} 