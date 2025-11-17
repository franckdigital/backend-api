import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../entities/location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Location]),
        RolesModule
    ],
    providers: [LocationsService],
    controllers: [LocationsController],
    exports: [LocationsService, TypeOrmModule],
})
export class LocationsModule { } 