import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractType } from '../entities/contract-type.entity';
import { ContractTypesService } from './contract-types.service';
import { ContractTypesController } from './contract-types.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContractType]),
        RolesModule
    ],
    providers: [ContractTypesService],
    controllers: [ContractTypesController],
    exports: [ContractTypesService, TypeOrmModule],
})
export class ContractTypesModule { } 