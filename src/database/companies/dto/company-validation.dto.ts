import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateCompanyDto {
  @ApiProperty({
    description: 'Whether to approve or reject the company',
    example: true
  })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({
    description: 'Notes about the validation decision',
    example: 'Company documents verified and approved for job posting'
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiPropertyOptional({
    description: 'Whether the company can post job offers after approval',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  canPostJobOffers?: boolean;
}

export class CompanyValidationResponseDto {
  @ApiProperty({
    description: 'Validation success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  companyId: string;

  @ApiProperty({
    description: 'Validation action performed',
    example: 'approved'
  })
  action: 'approved' | 'rejected';

  @ApiProperty({
    description: 'Validation completion message',
    example: 'Company has been successfully approved and can now post job offers'
  })
  message: string;

  @ApiProperty({
    description: 'Whether the company is now verified',
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the company can post job offers',
    example: true
  })
  canPostJobOffers: boolean;

  @ApiProperty({
    description: 'Verification date',
    example: '2024-01-15T10:30:00Z'
  })
  verificationDate: Date;
} 