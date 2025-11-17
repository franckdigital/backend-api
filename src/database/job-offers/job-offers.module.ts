import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from '../entities/job-offer.entity';
import { Company } from '../entities/company.entity';
import { ActivitySector } from '../entities/activity-sector.entity';
import { ContractType } from '../entities/contract-type.entity';
import { EducationLevel } from '../entities/education-level.entity';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { Location } from '../entities/location.entity';
import { DisabilityType } from '../entities/disability-type.entity';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { RolesModule } from '../roles/roles.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            JobOffer,
            Company,
            ActivitySector,
            ContractType,
            EducationLevel,
            ExperienceLevel,
            Location,
            DisabilityType,
        ]),
        RolesModule,
        CompaniesModule
    ],
    providers: [JobOffersService],
    controllers: [JobOffersController],
    exports: [JobOffersService, TypeOrmModule],
})
export class JobOffersModule { } 