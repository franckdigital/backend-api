import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum StatisticsPeriod {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_3_MONTHS = 'last_3_months',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom'
}

export class StatisticsQueryDto {
  @ApiPropertyOptional({ 
    description: 'Période pour les statistiques',
    enum: StatisticsPeriod,
    default: StatisticsPeriod.ALL_TIME
  })
  @IsOptional()
  @IsEnum(StatisticsPeriod)
  period?: StatisticsPeriod = StatisticsPeriod.ALL_TIME;

  @ApiPropertyOptional({ 
    description: 'Date de début pour la période personnalisée (format YYYY-MM-DD)' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Date de fin pour la période personnalisée (format YYYY-MM-DD)' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrer par localisation spécifique' 
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrer par secteur d\'activité spécifique' 
  })
  @IsOptional()
  @IsString()
  activitySectorId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrer par type de handicap spécifique' 
  })
  @IsOptional()
  @IsString()
  disabilityTypeId?: string;

  @ApiPropertyOptional({ 
    description: 'Inclure les statistiques détaillées par localisation',
    default: true 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeLocationStats?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Inclure les statistiques détaillées par secteur d\'activité',
    default: true 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeActivitySectorStats?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Inclure les statistiques détaillées par type de handicap',
    default: true 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDisabilityStats?: boolean = true;
} 