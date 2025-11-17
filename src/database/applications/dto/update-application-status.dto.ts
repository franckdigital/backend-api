import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsDate, IsDateString, IsInt, Min, Max, IsDecimal, IsBoolean } from 'class-validator';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'The new status of the application',
    enum: ApplicationStatus,
    example: ApplicationStatus.SHORTLISTED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Notes about the status change',
    example: 'Candidate meets all requirements and will proceed to interview',
  })
  @IsOptional()
  @IsString()
  statusNotes?: string;

  @ApiPropertyOptional({
    description: 'Employer feedback on the application',
    example: 'Impressive qualifications and experience',
  })
  @IsOptional()
  @IsString()
  employerFeedback?: string;

  @ApiPropertyOptional({
    description: 'Interview scheduled date and time (ISO string)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  interviewScheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Interview location',
    example: 'Company Office, Room 205',
  })
  @IsOptional()
  @IsString()
  interviewLocation?: string;

  @ApiPropertyOptional({
    description: 'Meeting URL for remote interviews',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsString()
  interviewMeetingUrl?: string;

  @ApiPropertyOptional({
    description: 'Notes about the interview',
    example: 'Please bring portfolio and references',
  })
  @IsOptional()
  @IsString()
  interviewNotes?: string;

  @ApiPropertyOptional({
    description: 'Interview rating (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  interviewRating?: number;

  @ApiPropertyOptional({
    description: 'Offered salary if selected',
    example: 50000.00,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  offeredSalary?: number;

  @ApiPropertyOptional({
    description: 'Contract terms if selected',
    example: 'Full-time, permanent position with benefits',
  })
  @IsOptional()
  @IsString()
  contractTerms?: string;

  @ApiPropertyOptional({
    description: 'Proposed start date (ISO date string)',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString()
  proposedStartDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the candidate is hired',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isHired?: boolean;
} 