import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsString, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from './update-application-status.dto';

export class ApplicationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by job offer ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  jobOfferId?: string;

  @ApiPropertyOptional({
    description: 'Filter by candidate ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @ApiPropertyOptional({
    description: 'Filter by supporting NGO ID',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  supportingNgoId?: string;

  @ApiPropertyOptional({
    description: 'Filter by application status',
    enum: ApplicationStatus,
    example: ApplicationStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Filter by hired status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHired?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by accessibility support need',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  needsAccessibilitySupport?: boolean;

  @ApiPropertyOptional({
    description: 'Filter applications created after this date (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter applications created before this date (ISO string)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Search in cover letter, motivation letter, and additional notes',
    example: 'software engineer',
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({
    description: 'Number of records to skip for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Number of records to take for pagination',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class ApplicationPageQueryDto extends ApplicationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
} 