import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  Candidate,
  Company,
  Ngo,
  JobOffer,
  Application,
  DisabilityType,
  User,
  ActivitySector,
  Location,
} from '../entities';
import {
  OverallStatisticsDto,
  CandidateStatisticsDto,
  CompanyStatisticsDto,
  NgoStatisticsDto,
  JobOfferStatisticsDto,
  ApplicationStatisticsDto,
  DisabilityStatisticsDto,
  LocationStatisticsDto,
  ActivitySectorStatisticsDto,
  DashboardMetricsDto,
  GrowthStatisticsDto,
  TimeSeriesDataDto,
} from './dto/statistics-response.dto';
import { StatisticsQueryDto, StatisticsPeriod } from './dto/statistics-query.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Ngo)
    private ngoRepository: Repository<Ngo>,
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(DisabilityType)
    private disabilityTypeRepository: Repository<DisabilityType>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActivitySector)
    private activitySectorRepository: Repository<ActivitySector>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  /**
   * Génère toutes les statistiques globales
   */
  async getOverallStatistics(query: StatisticsQueryDto): Promise<OverallStatisticsDto> {
    const dateRange = this.getDateRange(query);

    const [
      candidates,
      companies,
      ngos,
      jobOffers,
      applications,
      disabilityStatistics,
      locationStatistics,
      activitySectorStatistics,
    ] = await Promise.all([
      this.getCandidateStatistics(dateRange),
      this.getCompanyStatistics(dateRange),
      this.getNgoStatistics(dateRange),
      this.getJobOfferStatistics(dateRange),
      this.getApplicationStatistics(dateRange),
      query.includeDisabilityStats ? this.getDisabilityStatistics(dateRange) : [],
      query.includeLocationStats ? this.getLocationStatistics(dateRange) : [],
      query.includeActivitySectorStats ? this.getActivitySectorStatistics(dateRange) : [],
    ]);

    return {
      candidates,
      companies,
      ngos,
      jobOffers,
      applications,
      disabilityStatistics,
      locationStatistics,
      activitySectorStatistics,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Génère les métriques pour le tableau de bord
   */
  async getDashboardMetrics(query: StatisticsQueryDto): Promise<DashboardMetricsDto> {
    const dateRange = this.getDateRange(query);
    const monthRange = this.getDateRange({ ...query, period: StatisticsPeriod.LAST_30_DAYS });

    const [
      totalUsers,
      newUsersThisMonth,
      totalApplications,
      hiredApplications,
      totalJobOffers,
      avgProcessingTimeResult,
    ] = await Promise.all([
      this.userRepository.count(this.buildWhereClause(dateRange)),
      this.userRepository.count(this.buildWhereClause(monthRange)),
      this.applicationRepository.count(this.buildWhereClause(dateRange)),
      this.applicationRepository.count({
        ...this.buildWhereClause(dateRange),
        isHired: true,
      }),
      this.jobOfferRepository.count(this.buildWhereClause(dateRange)),
      this.getAverageProcessingTime(dateRange),
    ]);

    const jobPlacementRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
    const applicationToHireRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
    const avgApplicationsPerJobOffer = totalJobOffers > 0 ? totalApplications / totalJobOffers : 0;

    return {
      totalUsers,
      newUsersThisMonth,
      jobPlacementRate: Math.round(jobPlacementRate * 100) / 100,
      applicationToHireRate: Math.round(applicationToHireRate * 100) / 100,
      avgApplicationsPerJobOffer: Math.round(avgApplicationsPerJobOffer * 100) / 100,
      avgProcessingTime: avgProcessingTimeResult,
    };
  }

  /**
   * Génère les statistiques de croissance
   */
  async getGrowthStatistics(query: StatisticsQueryDto): Promise<GrowthStatisticsDto> {
    const dateRange = this.getDateRange(query);

    const [
      candidateRegistrations,
      companyRegistrations,
      jobOfferPublications,
      applicationSubmissions,
    ] = await Promise.all([
      this.getTimeSeriesData('candidates', 'createdAt', dateRange),
      this.getTimeSeriesData('companies', 'createdAt', dateRange),
      this.getTimeSeriesData('job_offers', 'publishedAt', dateRange),
      this.getTimeSeriesData('applications', 'createdAt', dateRange),
    ]);

    return {
      candidateRegistrations,
      companyRegistrations,
      jobOfferPublications,
      applicationSubmissions,
    };
  }

  /**
   * Génère les statistiques des candidats
   */
  private async getCandidateStatistics(dateRange: any): Promise<CandidateStatisticsDto> {
    const whereClause = this.buildWhereClause(dateRange);

    const [
      totalCandidates,
      activeCandidates,
      candidatesWithCompleteProfile,
      availableCandidates,
      candidatesManagedByNgo,
    ] = await Promise.all([
      this.candidateRepository.count(whereClause),
      this.candidateRepository.count({ ...whereClause, isActive: true }),
      this.candidateRepository.count({ ...whereClause, isProfileComplete: true }),
      this.candidateRepository.count({ ...whereClause, isAvailable: true }),
      this.candidateRepository.count({ ...whereClause, isManagedByNgo: true }),
    ]);

    return {
      totalCandidates,
      activeCandidates,
      inactiveCandidates: totalCandidates - activeCandidates,
      candidatesWithCompleteProfile,
      availableCandidates,
      candidatesManagedByNgo,
    };
  }

  /**
   * Génère les statistiques des entreprises
   */
  private async getCompanyStatistics(dateRange: any): Promise<CompanyStatisticsDto> {
    const whereClause = this.buildWhereClause(dateRange);

    const [
      totalCompanies,
      verifiedCompanies,
      activeCompanies,
      companiesCanPostJobs,
      companiesSubjectToQuota,
      compliantCompanies,
    ] = await Promise.all([
      this.companyRepository.count(whereClause),
      this.companyRepository.count({ ...whereClause, isVerified: true }),
      this.companyRepository.count({ ...whereClause, isActive: true }),
      this.companyRepository.count({ ...whereClause, canPostJobOffers: true }),
      this.companyRepository.count({ ...whereClause, isSubjectToDisabilityQuota: true }),
      this.companyRepository.count({ ...whereClause, isCompliantWithLaw: true }),
    ]);

    return {
      totalCompanies,
      verifiedCompanies,
      unverifiedCompanies: totalCompanies - verifiedCompanies,
      activeCompanies,
      companiesCanPostJobs,
      companiesSubjectToQuota,
      compliantCompanies,
    };
  }

  /**
   * Génère les statistiques des ONG
   */
  private async getNgoStatistics(dateRange: any): Promise<NgoStatisticsDto> {
    const whereClause = this.buildWhereClause(dateRange);

    const [
      totalNgos,
      verifiedNgos,
      activeNgos,
      ngosCanSupportCandidates,
    ] = await Promise.all([
      this.ngoRepository.count(whereClause),
      this.ngoRepository.count({ ...whereClause, isVerified: true }),
      this.ngoRepository.count({ ...whereClause, isActive: true }),
      this.ngoRepository.count({ ...whereClause, canSupportCandidates: true }),
    ]);

    // Calculer les totaux agrégés
    const { conditions: ngoConditions, parameters: ngoParameters } = this.buildWhereCondition(dateRange, 'ngo');
    
    let totalCandidatesSupported = 0;
    let totalSuccessfulPlacements = 0;

    if (ngoConditions.length > 0) {
      const candidatesSupportedQuery = this.ngoRepository
        .createQueryBuilder('ngo')
        .select('SUM(ngo.totalCandidatesSupported)', 'total')
        .where(ngoConditions[0], ngoParameters);
      
      const placementsQuery = this.ngoRepository
        .createQueryBuilder('ngo')
        .select('SUM(ngo.successfulPlacements)', 'total')
        .where(ngoConditions[0], ngoParameters);

      const [candidatesResult, placementsResult] = await Promise.all([
        candidatesSupportedQuery.getRawOne(),
        placementsQuery.getRawOne()
      ]);

      totalCandidatesSupported = parseInt(candidatesResult?.total) || 0;
      totalSuccessfulPlacements = parseInt(placementsResult?.total) || 0;
    } else {
      // Si pas de filtre de date, on calcule sans condition
      const [candidatesResult, placementsResult] = await Promise.all([
        this.ngoRepository
          .createQueryBuilder('ngo')
          .select('SUM(ngo.totalCandidatesSupported)', 'total')
          .getRawOne(),
        this.ngoRepository
          .createQueryBuilder('ngo')
          .select('SUM(ngo.successfulPlacements)', 'total')
          .getRawOne()
      ]);

      totalCandidatesSupported = parseInt(candidatesResult?.total) || 0;
      totalSuccessfulPlacements = parseInt(placementsResult?.total) || 0;
    }

    return {
      totalNgos,
      verifiedNgos,
      activeNgos,
      ngosCanSupportCandidates,
      totalCandidatesSupported,
      totalSuccessfulPlacements,
    };
  }

  /**
   * Génère les statistiques des offres d'emploi
   */
  private async getJobOfferStatistics(dateRange: any): Promise<JobOfferStatisticsDto> {
    const whereClause = this.buildWhereClause(dateRange);

    const [
      totalJobOffers,
      publishedJobOffers,
      draftJobOffers,
      pausedJobOffers,
      closedJobOffers,
      expiredJobOffers,
      disabilityFriendlyOffers,
      exclusiveForDisabledOffers,
      remoteWorkOffers,
      hybridWorkOffers,
    ] = await Promise.all([
      this.jobOfferRepository.count(whereClause),
      this.jobOfferRepository.count({ ...whereClause, status: 'published' }),
      this.jobOfferRepository.count({ ...whereClause, status: 'draft' }),
      this.jobOfferRepository.count({ ...whereClause, status: 'paused' }),
      this.jobOfferRepository.count({ ...whereClause, status: 'closed' }),
      this.jobOfferRepository.count({ ...whereClause, status: 'expired' }),
      this.jobOfferRepository.count({ ...whereClause, isDisabilityFriendly: true }),
      this.jobOfferRepository.count({ ...whereClause, isExclusiveForDisabled: true }),
      this.jobOfferRepository.count({ ...whereClause, isRemoteWork: true }),
      this.jobOfferRepository.count({ ...whereClause, isHybridWork: true }),
    ]);

    return {
      totalJobOffers,
      publishedJobOffers,
      draftJobOffers,
      pausedJobOffers,
      closedJobOffers,
      expiredJobOffers,
      disabilityFriendlyOffers,
      exclusiveForDisabledOffers,
      remoteWorkOffers,
      hybridWorkOffers,
    };
  }

  /**
   * Génère les statistiques des candidatures
   */
  private async getApplicationStatistics(dateRange: any): Promise<ApplicationStatisticsDto> {
    const whereClause = this.buildWhereClause(dateRange);

    const [
      totalApplications,
      submittedApplications,
      underReviewApplications,
      shortlistedApplications,
      interviewScheduledApplications,
      interviewedApplications,
      selectedApplications,
      rejectedApplications,
      withdrawnApplications,
      hiredApplications,
    ] = await Promise.all([
      this.applicationRepository.count(whereClause),
      this.applicationRepository.count({ ...whereClause, status: 'submitted' }),
      this.applicationRepository.count({ ...whereClause, status: 'under_review' }),
      this.applicationRepository.count({ ...whereClause, status: 'shortlisted' }),
      this.applicationRepository.count({ ...whereClause, status: 'interview_scheduled' }),
      this.applicationRepository.count({ ...whereClause, status: 'interviewed' }),
      this.applicationRepository.count({ ...whereClause, status: 'selected' }),
      this.applicationRepository.count({ ...whereClause, status: 'rejected' }),
      this.applicationRepository.count({ ...whereClause, status: 'withdrawn' }),
      this.applicationRepository.count({ ...whereClause, isHired: true }),
    ]);

    return {
      totalApplications,
      submittedApplications,
      underReviewApplications,
      shortlistedApplications,
      interviewScheduledApplications,
      interviewedApplications,
      selectedApplications,
      rejectedApplications,
      withdrawnApplications,
      hiredApplications,
    };
  }

  /**
   * Génère les statistiques par type de handicap
   */
  private async getDisabilityStatistics(dateRange: any): Promise<DisabilityStatisticsDto[]> {
    const totalCandidates = await this.candidateRepository.count(this.buildWhereClause(dateRange));

    const { conditions: candidateConditions, parameters: candidateParameters } = this.buildWhereCondition(dateRange, 'candidate');
    
    let disabilityStatsQuery = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoin('candidate.disabilityType', 'disabilityType')
      .select('disabilityType.name', 'disabilityTypeName')
      .addSelect('COUNT(candidate.id)', 'count')
      .groupBy('disabilityType.id');

    if (candidateConditions.length > 0) {
      disabilityStatsQuery = disabilityStatsQuery.where(candidateConditions[0], candidateParameters);
    }

    const disabilityStats = await disabilityStatsQuery.getRawMany();

    return disabilityStats.map(stat => ({
      disabilityTypeName: stat.disabilityTypeName,
      count: parseInt(stat.count),
      percentage: totalCandidates > 0 ? Math.round((parseInt(stat.count) / totalCandidates) * 10000) / 100 : 0,
    }));
  }

  /**
   * Génère les statistiques par localisation
   */
  private async getLocationStatistics(dateRange: any): Promise<LocationStatisticsDto[]> {
    const locations = await this.locationRepository.find();
    const locationStats: LocationStatisticsDto[] = [];

    for (const location of locations) {
      const [candidatesCount, companiesCount, ngosCount, jobOffersCount] = await Promise.all([
        this.candidateRepository.count({
          ...this.buildWhereClause(dateRange),
          locationId: location.id,
        }),
        this.companyRepository.count({
          ...this.buildWhereClause(dateRange),
          locationId: location.id,
        }),
        this.ngoRepository.count({
          ...this.buildWhereClause(dateRange),
          locationId: location.id,
        }),
        this.jobOfferRepository.count({
          ...this.buildWhereClause(dateRange),
          locationId: location.id,
        }),
      ]);

      if (candidatesCount > 0 || companiesCount > 0 || ngosCount > 0 || jobOffersCount > 0) {
        locationStats.push({
          locationName: location.name,
          candidatesCount,
          companiesCount,
          ngosCount,
          jobOffersCount,
        });
      }
    }

    return locationStats;
  }

  /**
   * Génère les statistiques par secteur d'activité
   */
  private async getActivitySectorStatistics(dateRange: any): Promise<ActivitySectorStatisticsDto[]> {
    const sectors = await this.activitySectorRepository.find();
    const sectorStats: ActivitySectorStatisticsDto[] = [];

    for (const sector of sectors) {
      const [companiesCount, jobOffersCount] = await Promise.all([
        this.companyRepository.count({
          ...this.buildWhereClause(dateRange),
          activitySectorId: sector.id,
        }),
        this.jobOfferRepository.count({
          ...this.buildWhereClause(dateRange),
          activitySectorId: sector.id,
        }),
      ]);

      if (companiesCount > 0 || jobOffersCount > 0) {
        sectorStats.push({
          sectorName: sector.name,
          companiesCount,
          jobOffersCount,
        });
      }
    }

    return sectorStats;
  }

  /**
   * Calcule le temps moyen de traitement d'une candidature
   */
  private async getAverageProcessingTime(dateRange: any): Promise<number> {
    const { conditions: applicationConditions, parameters: applicationParameters } = this.buildWhereCondition(dateRange, 'application');
    
    let query = this.applicationRepository
      .createQueryBuilder('application')
      .select('AVG(application.daysToDecision)', 'avgDays')
      .where('application.daysToDecision IS NOT NULL');

    if (applicationConditions.length > 0) {
      query = query.andWhere(applicationConditions[0], applicationParameters);
    }

    const result = await query.getRawOne();
    return Math.round(parseFloat(result?.avgDays) || 0);
  }

  /**
   * Génère des données de série temporelle
   */
  private async getTimeSeriesData(
    tableName: string,
    dateColumn: string,
    dateRange: any,
  ): Promise<TimeSeriesDataDto[]> {
    const query = `
      SELECT 
        DATE(${dateColumn}) as date,
        COUNT(*) as value
      FROM ${tableName}
      WHERE ${dateColumn} >= ? AND ${dateColumn} <= ?
      GROUP BY DATE(${dateColumn})
      ORDER BY date ASC
    `;

    const results = await this.candidateRepository.query(query, [
      dateRange.startDate,
      dateRange.endDate,
    ]);

    return results.map((row: any) => ({
      date: row.date,
      value: parseInt(row.value),
    }));
  }

  /**
   * Détermine la plage de dates basée sur la période
   */
  private getDateRange(query: StatisticsQueryDto) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (query.period) {
      case StatisticsPeriod.LAST_7_DAYS:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case StatisticsPeriod.LAST_30_DAYS:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case StatisticsPeriod.LAST_3_MONTHS:
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case StatisticsPeriod.LAST_6_MONTHS:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case StatisticsPeriod.LAST_YEAR:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case StatisticsPeriod.CUSTOM:
        startDate = query.startDate ? new Date(query.startDate) : new Date('1970-01-01');
        endDate = query.endDate ? new Date(query.endDate) : now;
        break;
      default: // ALL_TIME
        startDate = new Date('1970-01-01');
        endDate = now;
    }

    return { startDate, endDate };
  }

  /**
   * Construit la clause WHERE pour les requêtes TypeORM
   */
  private buildWhereClause(dateRange: any, alias?: string) {
    const prefix = alias ? `${alias}.` : '';
    const whereClause: any = {};

    if (dateRange.startDate && dateRange.endDate) {
      whereClause[`${prefix}createdAt`] = Between(dateRange.startDate, dateRange.endDate);
    } else if (dateRange.startDate) {
      whereClause[`${prefix}createdAt`] = MoreThanOrEqual(dateRange.startDate);
    } else if (dateRange.endDate) {
      whereClause[`${prefix}createdAt`] = LessThanOrEqual(dateRange.endDate);
    }

    return whereClause;
  }

  /**
   * Construit la condition WHERE pour les QueryBuilders
   */
  private buildWhereCondition(dateRange: any, alias: string) {
    const conditions: string[] = [];
    const parameters: any = {};

    if (dateRange.startDate && dateRange.endDate) {
      conditions.push(`${alias}.createdAt BETWEEN :startDate AND :endDate`);
      parameters.startDate = dateRange.startDate;
      parameters.endDate = dateRange.endDate;
    } else if (dateRange.startDate) {
      conditions.push(`${alias}.createdAt >= :startDate`);
      parameters.startDate = dateRange.startDate;
    } else if (dateRange.endDate) {
      conditions.push(`${alias}.createdAt <= :endDate`);
      parameters.endDate = dateRange.endDate;
    }

    return { conditions, parameters };
  }
} 