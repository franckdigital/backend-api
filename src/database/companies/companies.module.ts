import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { ActivitySector } from '../entities/activity-sector.entity';
import { CompanySize } from '../entities/company-size.entity';
import { Location } from '../entities/location.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Company,
            User,
            ActivitySector,
            CompanySize,
            Location,
        ]),
        RolesModule
    ],
    providers: [CompaniesService],
    controllers: [CompaniesController],
    exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule { } 