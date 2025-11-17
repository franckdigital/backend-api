import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from '../entities/profession.entity';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profession]),
        RolesModule
    ],
    providers: [ProfessionsService],
    controllers: [ProfessionsController],
    exports: [ProfessionsService, TypeOrmModule],
})
export class ProfessionsModule { } 