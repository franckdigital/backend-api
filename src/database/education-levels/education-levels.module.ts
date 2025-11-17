import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationLevel } from '../entities/education-level.entity';
import { EducationLevelsService } from './education-levels.service';
import { EducationLevelsController } from './education-levels.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EducationLevel]),
        RolesModule
    ],
    providers: [EducationLevelsService],
    controllers: [EducationLevelsController],
    exports: [EducationLevelsService, TypeOrmModule],
})
export class EducationLevelsModule { } 