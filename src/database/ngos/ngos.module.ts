import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgosController } from './ngos.controller';
import { NgosProfileController } from './ngos-profile.controller';
import { NgosService } from './ngos.service';
import { Ngo } from '../entities/ngo.entity';
import { User } from '../entities/user.entity';
import { Candidate } from '../entities/candidate.entity';
import { ActivitySector } from '../entities/activity-sector.entity';
import { DisabilityType } from '../entities/disability-type.entity';
import { Location } from '../entities/location.entity';
import { EducationLevel } from '../entities/education-level.entity';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { Profession } from '../entities/profession.entity';
import { Document } from '../entities/document.entity';
import { RolesModule } from '../roles/roles.module';
import { CommonModule } from '../../common/common.module';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ngo,
      User,
      Candidate,
      ActivitySector,
      DisabilityType,
      Location,
      EducationLevel,
      ExperienceLevel,
      Profession,
      Document,
    ]),
    RolesModule,
    CommonModule,
    StorageModule,
  ],
  controllers: [NgosController, NgosProfileController],
  providers: [NgosService],
  exports: [NgosService],
})
export class NgosModule {} 