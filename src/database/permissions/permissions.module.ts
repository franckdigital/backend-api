import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { CommonModule } from '../../common/common.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission]),
        CommonModule,
        forwardRef(() => UsersModule),
    ],
    providers: [PermissionsService],
    controllers: [PermissionsController],
    exports: [PermissionsService],
})
export class PermissionsModule { } 