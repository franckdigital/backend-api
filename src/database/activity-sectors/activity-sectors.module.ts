import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitySector } from '../entities/activity-sector.entity';
import { ActivitySectorsService } from './activity-sectors.service';
import { ActivitySectorsController } from './activity-sectors.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ActivitySector]),
        RolesModule
    ],
    providers: [ActivitySectorsService],
    controllers: [ActivitySectorsController],
    exports: [ActivitySectorsService, TypeOrmModule],
})
export class ActivitySectorsModule { } 