import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CommonModule } from '../../common/common.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, User, Permission]),
        forwardRef(() => UsersModule),
        forwardRef(() => PermissionsModule),
        CommonModule,
    ],
    providers: [RolesService, RolesGuard],
    controllers: [RolesController],
    exports: [RolesService, RolesGuard],
})
export class RolesModule { } 