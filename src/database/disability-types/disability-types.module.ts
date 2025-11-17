import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisabilityType } from '../entities/disability-type.entity';
import { DisabilityTypesService } from './disability-types.service';
import { DisabilityTypesController } from './disability-types.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DisabilityType]),
        RolesModule
    ],
    providers: [DisabilityTypesService],
    controllers: [DisabilityTypesController],
    exports: [DisabilityTypesService, TypeOrmModule],
})
export class DisabilityTypesModule { } 