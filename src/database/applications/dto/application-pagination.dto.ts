import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsString, IsBoolean, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus } from './update-application-status.dto';

export class ApplicationPaginationDto {
    @ApiPropertyOptional({
        description: 'Page number (starts from 1)',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    size?: number = 10;

    @ApiPropertyOptional({
        description: 'Search text in cover letter, motivation letter, and additional notes',
        example: 'software engineer',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by job offer ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID()
    jobOfferId?: string;

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
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter applications created before this date (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'lastStatusUpdate', 'status'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
} 