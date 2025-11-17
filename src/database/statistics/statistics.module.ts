import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { RolesModule } from '../roles/roles.module';
import { 
  Candidate, 
  Company, 
  Ngo, 
  JobOffer, 
  Application, 
  DisabilityType,
  User,
  ActivitySector,
  ContractType,
  EducationLevel,
  ExperienceLevel,
  Location
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      Company,
      Ngo,
      JobOffer,
      Application,
      DisabilityType,
      User,
      ActivitySector,
      ContractType,
      EducationLevel,
      ExperienceLevel,
      Location
    ]),
    RolesModule
  ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService]
})
export class StatisticsModule { } 