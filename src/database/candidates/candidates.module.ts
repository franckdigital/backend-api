import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../entities/candidate.entity';
import { User } from '../entities/user.entity';
import { DisabilityType } from '../entities/disability-type.entity';
import { EducationLevel } from '../entities/education-level.entity';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { Profession } from '../entities/profession.entity';
import { Location } from '../entities/location.entity';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Candidate,
            User,
            DisabilityType,
            EducationLevel,
            ExperienceLevel,
            Profession,
            Location,
        ]),
        RolesModule
    ],
    providers: [CandidatesService],
    controllers: [CandidatesController],
    exports: [CandidatesService, TypeOrmModule],
})
export class CandidatesModule { } 