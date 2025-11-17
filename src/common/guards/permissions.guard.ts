import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../database/entities/user.entity';
import { IS_PUBLIC_KEY } from './global-auth.guard';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if the route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If route is public, allow access
        if (isPublic) {
            return true;
        }

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no permissions are required, allow access
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: User = request.user;

        // If no user is present in the request (not authenticated)
        if (!user || !user.roles) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every(requiredPermission => {
            return user.roles.some(role =>
                role.permissions.some(permission =>
                    permission.code === requiredPermission &&
                    permission.isActive
                )
            );
        });

        if (!hasAllPermissions) {
            throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
} 