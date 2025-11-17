import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceLevel } from '../entities/experience-level.entity';
import { ExperienceLevelsService } from './experience-levels.service';
import { ExperienceLevelsController } from './experience-levels.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExperienceLevel]),
        RolesModule
    ],
    providers: [ExperienceLevelsService],
    controllers: [ExperienceLevelsController],
    exports: [ExperienceLevelsService, TypeOrmModule],
})
export class ExperienceLevelsModule { } 