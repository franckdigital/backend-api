import { Injectable } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UserPermissionsService {
    getUserPermissions(user: User): string[] {
        const permissions = new Set<string>();

        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                if (permission.isActive) {
                    permissions.add(permission.code);
                }
            });
        });

        return Array.from(permissions);
    }

    hasPermission(user: User, permissionCode: string): boolean {
        return user.roles.some(role =>
            role.permissions.some(permission =>
                permission.code === permissionCode &&
                permission.isActive
            )
        );
    }

    hasAnyPermission(user: User, permissionCodes: string[]): boolean {
        return permissionCodes.some(code => this.hasPermission(user, code));
    }

    hasAllPermissions(user: User, permissionCodes: string[]): boolean {
        return permissionCodes.every(code => this.hasPermission(user, code));
    }
} 