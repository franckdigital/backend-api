import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import {
  OverallStatisticsDto,
  DashboardMetricsDto,
  GrowthStatisticsDto,
  CandidateStatisticsDto,
  CompanyStatisticsDto,
  NgoStatisticsDto,
  JobOfferStatisticsDto,
  ApplicationStatisticsDto,
  DisabilityStatisticsDto,
  LocationStatisticsDto,
  ActivitySectorStatisticsDto,
} from './dto/statistics-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ 
    summary: 'Obtenir toutes les statistiques globales',
    description: 'Retourne un aperçu complet de toutes les statistiques de l\'application' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques globales récupérées avec succès',
    type: OverallStatisticsDto 
  })
  async getOverallStatistics(@Query() query: StatisticsQueryDto): Promise<OverallStatisticsDto> {
    return this.statisticsService.getOverallStatistics(query);
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Obtenir les métriques du tableau de bord',
    description: 'Retourne les métriques clés pour le tableau de bord administrateur' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métriques du tableau de bord récupérées avec succès',
    type: DashboardMetricsDto 
  })
  async getDashboardMetrics(@Query() query: StatisticsQueryDto): Promise<DashboardMetricsDto> {
    return this.statisticsService.getDashboardMetrics(query);
  }

  @Get('growth')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques de croissance',
    description: 'Retourne les données de croissance sous forme de séries temporelles' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques de croissance récupérées avec succès',
    type: GrowthStatisticsDto 
  })
  async getGrowthStatistics(@Query() query: StatisticsQueryDto): Promise<GrowthStatisticsDto> {
    return this.statisticsService.getGrowthStatistics(query);
  }

  @Get('candidates')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des candidats',
    description: 'Retourne les statistiques détaillées concernant les candidats' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des candidats récupérées avec succès',
    type: CandidateStatisticsDto 
  })
  async getCandidateStatistics(@Query() query: StatisticsQueryDto): Promise<CandidateStatisticsDto> {
    const stats = await this.statisticsService.getOverallStatistics(query);
    return stats.candidates;
  }

  @Get('companies')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des entreprises',
    description: 'Retourne les statistiques détaillées concernant les entreprises' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des entreprises récupérées avec succès',
    type: CompanyStatisticsDto 
  })
  async getCompanyStatistics(@Query() query: StatisticsQueryDto): Promise<CompanyStatisticsDto> {
    const stats = await this.statisticsService.getOverallStatistics(query);
    return stats.companies;
  }

  @Get('ngos')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des ONG',
    description: 'Retourne les statistiques détaillées concernant les organisations' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des ONG récupérées avec succès',
    type: NgoStatisticsDto 
  })
  async getNgoStatistics(@Query() query: StatisticsQueryDto): Promise<NgoStatisticsDto> {
    const stats = await this.statisticsService.getOverallStatistics(query);
    return stats.ngos;
  }

  @Get('job-offers')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des offres d\'emploi',
    description: 'Retourne les statistiques détaillées concernant les offres d\'emploi' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des offres d\'emploi récupérées avec succès',
    type: JobOfferStatisticsDto 
  })
  async getJobOfferStatistics(@Query() query: StatisticsQueryDto): Promise<JobOfferStatisticsDto> {
    const stats = await this.statisticsService.getOverallStatistics(query);
    return stats.jobOffers;
  }

  @Get('applications')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques des candidatures',
    description: 'Retourne les statistiques détaillées concernant les candidatures' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des candidatures récupérées avec succès',
    type: ApplicationStatisticsDto 
  })
  async getApplicationStatistics(@Query() query: StatisticsQueryDto): Promise<ApplicationStatisticsDto> {
    const stats = await this.statisticsService.getOverallStatistics(query);
    return stats.applications;
  }

  @Get('disabilities')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques par type de handicap',
    description: 'Retourne la répartition des candidats par type de handicap' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par type de handicap récupérées avec succès',
    type: [DisabilityStatisticsDto] 
  })
  async getDisabilityStatistics(@Query() query: StatisticsQueryDto): Promise<DisabilityStatisticsDto[]> {
    const stats = await this.statisticsService.getOverallStatistics({
      ...query,
      includeDisabilityStats: true,
    });
    return stats.disabilityStatistics;
  }

  @Get('locations')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques par localisation',
    description: 'Retourne la répartition des utilisateurs par localisation géographique' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par localisation récupérées avec succès',
    type: [LocationStatisticsDto] 
  })
  async getLocationStatistics(@Query() query: StatisticsQueryDto): Promise<LocationStatisticsDto[]> {
    const stats = await this.statisticsService.getOverallStatistics({
      ...query,
      includeLocationStats: true,
    });
    return stats.locationStatistics;
  }

  @Get('activity-sectors')
  @ApiOperation({ 
    summary: 'Obtenir les statistiques par secteur d\'activité',
    description: 'Retourne la répartition des entreprises et offres par secteur d\'activité' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques par secteur d\'activité récupérées avec succès',
    type: [ActivitySectorStatisticsDto] 
  })
  async getActivitySectorStatistics(@Query() query: StatisticsQueryDto): Promise<ActivitySectorStatisticsDto[]> {
    const stats = await this.statisticsService.getOverallStatistics({
      ...query,
      includeActivitySectorStats: true,
    });
    return stats.activitySectorStatistics;
  }

  @Get('export')
  @ApiOperation({ 
    summary: 'Exporter les statistiques',
    description: 'Génère un export des statistiques pour analyse externe' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Export des statistiques généré avec succès' 
  })
  async exportStatistics(@Query() query: StatisticsQueryDto) {
    const stats = await this.statisticsService.getOverallStatistics(query);
    
    // Ajouter des métadonnées d'export
    return {
      ...stats,
      export: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0',
        period: query.period,
        filters: {
          locationId: query.locationId,
          activitySectorId: query.activitySectorId,
          disabilityTypeId: query.disabilityTypeId,
        },
      },
    };
  }
} 