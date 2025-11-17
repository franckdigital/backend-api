import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CandidateStatisticsDto {
  @ApiProperty({ description: 'Nombre total de candidats inscrits' })
  @IsNumber()
  totalCandidates: number;

  @ApiProperty({ description: 'Nombre de candidats actifs' })
  @IsNumber()
  activeCandidates: number;

  @ApiProperty({ description: 'Nombre de candidats inactifs' })
  @IsNumber()
  inactiveCandidates: number;

  @ApiProperty({ description: 'Nombre de candidats avec profil complet' })
  @IsNumber()
  candidatesWithCompleteProfile: number;

  @ApiProperty({ description: 'Nombre de candidats disponibles pour un emploi' })
  @IsNumber()
  availableCandidates: number;

  @ApiProperty({ description: 'Nombre de candidats gérés par des ONG' })
  @IsNumber()
  candidatesManagedByNgo: number;
}

export class DisabilityStatisticsDto {
  @ApiProperty({ description: 'Nom du type de handicap' })
  @IsString()
  disabilityTypeName: string;

  @ApiProperty({ description: 'Nombre de candidats avec ce type de handicap' })
  @IsNumber()
  count: number;

  @ApiProperty({ description: 'Pourcentage par rapport au total' })
  @IsNumber()
  percentage: number;
}

export class CompanyStatisticsDto {
  @ApiProperty({ description: 'Nombre total d\'entreprises inscrites' })
  @IsNumber()
  totalCompanies: number;

  @ApiProperty({ description: 'Nombre d\'entreprises vérifiées' })
  @IsNumber()
  verifiedCompanies: number;

  @ApiProperty({ description: 'Nombre d\'entreprises non vérifiées' })
  @IsNumber()
  unverifiedCompanies: number;

  @ApiProperty({ description: 'Nombre d\'entreprises actives' })
  @IsNumber()
  activeCompanies: number;

  @ApiProperty({ description: 'Nombre d\'entreprises pouvant publier des offres' })
  @IsNumber()
  companiesCanPostJobs: number;

  @ApiProperty({ description: 'Nombre d\'entreprises soumises au quota de handicap' })
  @IsNumber()
  companiesSubjectToQuota: number;

  @ApiProperty({ description: 'Nombre d\'entreprises en conformité légale' })
  @IsNumber()
  compliantCompanies: number;
}

export class NgoStatisticsDto {
  @ApiProperty({ description: 'Nombre total d\'ONG inscrites' })
  @IsNumber()
  totalNgos: number;

  @ApiProperty({ description: 'Nombre d\'ONG vérifiées' })
  @IsNumber()
  verifiedNgos: number;

  @ApiProperty({ description: 'Nombre d\'ONG actives' })
  @IsNumber()
  activeNgos: number;

  @ApiProperty({ description: 'Nombre d\'ONG pouvant soutenir des candidats' })
  @IsNumber()
  ngosCanSupportCandidates: number;

  @ApiProperty({ description: 'Nombre total de candidats soutenus par toutes les ONG' })
  @IsNumber()
  totalCandidatesSupported: number;

  @ApiProperty({ description: 'Nombre total de placements réussis' })
  @IsNumber()
  totalSuccessfulPlacements: number;
}

export class JobOfferStatisticsDto {
  @ApiProperty({ description: 'Nombre total d\'offres d\'emploi' })
  @IsNumber()
  totalJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres publiées' })
  @IsNumber()
  publishedJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres en brouillon' })
  @IsNumber()
  draftJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres en pause' })
  @IsNumber()
  pausedJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres fermées' })
  @IsNumber()
  closedJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres expirées' })
  @IsNumber()
  expiredJobOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres adaptées aux handicaps' })
  @IsNumber()
  disabilityFriendlyOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres exclusives aux personnes handicapées' })
  @IsNumber()
  exclusiveForDisabledOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres avec travail à distance' })
  @IsNumber()
  remoteWorkOffers: number;

  @ApiProperty({ description: 'Nombre d\'offres avec travail hybride' })
  @IsNumber()
  hybridWorkOffers: number;
}

export class ApplicationStatisticsDto {
  @ApiProperty({ description: 'Nombre total de candidatures' })
  @IsNumber()
  totalApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures soumises' })
  @IsNumber()
  submittedApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures en cours d\'examen' })
  @IsNumber()
  underReviewApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures présélectionnées' })
  @IsNumber()
  shortlistedApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures avec entretien programmé' })
  @IsNumber()
  interviewScheduledApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures avec entretien passé' })
  @IsNumber()
  interviewedApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures sélectionnées' })
  @IsNumber()
  selectedApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures rejetées' })
  @IsNumber()
  rejectedApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures retirées' })
  @IsNumber()
  withdrawnApplications: number;

  @ApiProperty({ description: 'Nombre de candidatures avec embauche confirmée' })
  @IsNumber()
  hiredApplications: number;
}

export class LocationStatisticsDto {
  @ApiProperty({ description: 'Nom de la localisation' })
  @IsString()
  locationName: string;

  @ApiProperty({ description: 'Nombre de candidats dans cette localisation' })
  @IsNumber()
  candidatesCount: number;

  @ApiProperty({ description: 'Nombre d\'entreprises dans cette localisation' })
  @IsNumber()
  companiesCount: number;

  @ApiProperty({ description: 'Nombre d\'ONG dans cette localisation' })
  @IsNumber()
  ngosCount: number;

  @ApiProperty({ description: 'Nombre d\'offres d\'emploi dans cette localisation' })
  @IsNumber()
  jobOffersCount: number;
}

export class ActivitySectorStatisticsDto {
  @ApiProperty({ description: 'Nom du secteur d\'activité' })
  @IsString()
  sectorName: string;

  @ApiProperty({ description: 'Nombre d\'entreprises dans ce secteur' })
  @IsNumber()
  companiesCount: number;

  @ApiProperty({ description: 'Nombre d\'offres d\'emploi dans ce secteur' })
  @IsNumber()
  jobOffersCount: number;
}

export class TimeSeriesDataDto {
  @ApiProperty({ description: 'Date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Valeur' })
  @IsNumber()
  value: number;
}

export class OverallStatisticsDto {
  @ApiProperty({ description: 'Statistiques des candidats' })
  candidates: CandidateStatisticsDto;

  @ApiProperty({ description: 'Statistiques par type de handicap', type: [DisabilityStatisticsDto] })
  disabilityStatistics: DisabilityStatisticsDto[];

  @ApiProperty({ description: 'Statistiques des entreprises' })
  companies: CompanyStatisticsDto;

  @ApiProperty({ description: 'Statistiques des ONG' })
  ngos: NgoStatisticsDto;

  @ApiProperty({ description: 'Statistiques des offres d\'emploi' })
  jobOffers: JobOfferStatisticsDto;

  @ApiProperty({ description: 'Statistiques des candidatures' })
  applications: ApplicationStatisticsDto;

  @ApiProperty({ description: 'Statistiques par localisation', type: [LocationStatisticsDto] })
  locationStatistics: LocationStatisticsDto[];

  @ApiProperty({ description: 'Statistiques par secteur d\'activité', type: [ActivitySectorStatisticsDto] })
  activitySectorStatistics: ActivitySectorStatisticsDto[];

  @ApiProperty({ description: 'Date de génération des statistiques' })
  @IsDateString()
  generatedAt: string;
}

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Nombre total d\'utilisateurs' })
  @IsNumber()
  totalUsers: number;

  @ApiProperty({ description: 'Nombre de nouveaux utilisateurs ce mois' })
  @IsNumber()
  newUsersThisMonth: number;

  @ApiProperty({ description: 'Taux de placement d\'emploi (%)' })
  @IsNumber()
  jobPlacementRate: number;

  @ApiProperty({ description: 'Taux de conversion candidatures/embauches (%)' })
  @IsNumber()
  applicationToHireRate: number;

  @ApiProperty({ description: 'Nombre moyen de candidatures par offre' })
  @IsNumber()
  avgApplicationsPerJobOffer: number;

  @ApiProperty({ description: 'Temps moyen de traitement d\'une candidature (jours)' })
  @IsNumber()
  avgProcessingTime: number;
}

export class GrowthStatisticsDto {
  @ApiProperty({ description: 'Évolution des inscriptions de candidats', type: [TimeSeriesDataDto] })
  candidateRegistrations: TimeSeriesDataDto[];

  @ApiProperty({ description: 'Évolution des inscriptions d\'entreprises', type: [TimeSeriesDataDto] })
  companyRegistrations: TimeSeriesDataDto[];

  @ApiProperty({ description: 'Évolution des publications d\'offres', type: [TimeSeriesDataDto] })
  jobOfferPublications: TimeSeriesDataDto[];

  @ApiProperty({ description: 'Évolution des candidatures', type: [TimeSeriesDataDto] })
  applicationSubmissions: TimeSeriesDataDto[];
} 