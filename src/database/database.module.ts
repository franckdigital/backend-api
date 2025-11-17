import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TokenBlacklistModule } from './token-blacklist/token-blacklist.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from '../common/common.module';

// MEPS Reference Modules
import { DisabilityTypesModule } from './disability-types/disability-types.module';
import { ActivitySectorsModule } from './activity-sectors/activity-sectors.module';
import { ContractTypesModule } from './contract-types/contract-types.module';
import { EducationLevelsModule } from './education-levels/education-levels.module';
import { ExperienceLevelsModule } from './experience-levels/experience-levels.module';
import { ProfessionsModule } from './professions/professions.module';
import { CompanySizesModule } from './company-sizes/company-sizes.module';
import { LocationsModule } from './locations/locations.module';

// MEPS Business Modules
import { CandidatesModule } from './candidates/candidates.module';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { NgosModule } from './ngos/ngos.module';
import { ApplicationsModule } from './applications/applications.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get('nodeEnv');
        return {
          type: 'mysql',
          host: configService.get('mysql.host'),
          port: configService.get('mysql.port'),
          username: configService.get('mysql.username'),
          password: configService.get('mysql.password'),
          database: configService.get('mysql.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          dropSchema: false,
          logging: configService.get('mysql.logging'),
          migrationsTableName: 'migrations_typeorm',
          migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
          migrationsRun: nodeEnv === 'production',
          charset: 'utf8mb4_general_ci',
          timezone: 'Z',
          legacySpatialSupport: false,
        };
      },
    }),
    // Core modules
    UsersModule,
    RolesModule,
    PermissionsModule,
    TokenBlacklistModule,
    CategoriesModule,
    
    // MEPS Reference modules
    DisabilityTypesModule,
    ActivitySectorsModule,
    ContractTypesModule,
    EducationLevelsModule,
    ExperienceLevelsModule,
    ProfessionsModule,
    CompanySizesModule,
    LocationsModule,
    
    // MEPS Business modules
    CandidatesModule,
    CompaniesModule,
    JobOffersModule,
    NgosModule,
    ApplicationsModule,
    StatisticsModule,
    
    forwardRef(() => CommonModule),
  ],
  exports: [
    TypeOrmModule,
    // Core modules
    UsersModule,
    RolesModule,
    PermissionsModule,
    TokenBlacklistModule,
    CategoriesModule,
    
    // MEPS Reference modules
    DisabilityTypesModule,
    ActivitySectorsModule,
    ContractTypesModule,
    EducationLevelsModule,
    ExperienceLevelsModule,
    ProfessionsModule,
    CompanySizesModule,
    LocationsModule,
    
    // MEPS Business modules
    CandidatesModule,
    CompaniesModule,
    JobOffersModule,
    NgosModule,
    ApplicationsModule,
    StatisticsModule,
  ],
})
export class DatabaseModule {} 