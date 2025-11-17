import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionQueryDto, PermissionPageQueryDto } from './dto/permission-query.dto';

@Injectable()
export class PermissionsService implements OnModuleInit {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) { }

    async onModuleInit() {
        await this.createDefaultPermissions();
    }

    private async createDefaultPermissions() {
        const defaultPermissions = [
            // Permissions pour les utilisateurs
            {
                name: 'Créer un utilisateur',
                code: 'users:create',
                description: 'Permet de créer un nouvel utilisateur',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Lire les utilisateurs',
                code: 'users:read',
                description: 'Permet de voir la liste des utilisateurs',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Voir un utilisateur',
                code: 'users:view',
                description: 'Permet de voir les détails d\'un utilisateur',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Modifier un utilisateur',
                code: 'users:update',
                description: 'Permet de modifier un utilisateur',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Supprimer un utilisateur',
                code: 'users:delete',
                description: 'Permet de supprimer un utilisateur',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Assigner des rôles',
                code: 'users:assign-roles',
                description: 'Permet d\'assigner des rôles aux utilisateurs',
                isSystem: true,
                isDefault: true
            },

            // Permissions pour les rôles
            {
                name: 'Créer un rôle',
                code: 'roles:create',
                description: 'Permet de créer un nouveau rôle',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Lire les rôles',
                code: 'roles:read',
                description: 'Permet de voir la liste des rôles',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Voir un rôle',
                code: 'roles:view',
                description: 'Permet de voir les détails d\'un rôle',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Modifier un rôle',
                code: 'roles:update',
                description: 'Permet de modifier un rôle',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Supprimer un rôle',
                code: 'roles:delete',
                description: 'Permet de supprimer un rôle',
                isSystem: true,
                isDefault: true
            },

            // Permissions pour les permissions
            {
                name: 'Créer une permission',
                code: 'permissions:create',
                description: 'Permet de créer une nouvelle permission',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Lire les permissions',
                code: 'permissions:read',
                description: 'Permet de voir la liste des permissions',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Modifier une permission',
                code: 'permissions:update',
                description: 'Permet de modifier une permission',
                isSystem: true,
                isDefault: true
            },
            {
                name: 'Supprimer une permission',
                code: 'permissions:delete',
                description: 'Permet de supprimer une permission',
                isSystem: true,
                isDefault: true
            }
        ];

        for (const permission of defaultPermissions) {
            const existingPermission = await this.permissionRepository.findOne({ 
                where: { code: permission.code } 
            });
            if (!existingPermission) {
                const newPermission = this.permissionRepository.create(permission);
                await this.permissionRepository.save(newPermission);
            }
        }
    }

    async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const existingPermission = await this.permissionRepository.findOne({ where: { code: createPermissionDto.code } });
        if (existingPermission) {
            throw new ConflictException(`Permission with code ${createPermissionDto.code} already exists`);
        }

        const permission = this.permissionRepository.create(createPermissionDto);
        return this.permissionRepository.save(permission);
    }

    async findAll(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async findOne(id: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }

    async findByKey(key: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { code: key } });
        if (!permission) {
            throw new NotFoundException(`Permission with code ${key} not found`);
        }
        return permission;
    }

    async findByIds(ids: string[]): Promise<Permission[]> {
        if (!ids.length) return [];
        return this.permissionRepository.find({ where: { id: In(ids) } });
    }

    async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }

        Object.assign(permission, dto);
        return this.permissionRepository.save(permission);
    }

    async remove(id: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }

        await this.permissionRepository.remove(permission);
        return permission;
    }

    async findWithFilters(queryOptions: PermissionQueryDto = {}) {
        const { search, sortBy, sortOrder, isDefault } = queryOptions;
        
        const queryBuilder = this.permissionRepository.createQueryBuilder('permission');
        
        if (search) {
            queryBuilder.where(
                'permission.code LIKE :search OR permission.name LIKE :search OR permission.description LIKE :search',
                { search: `%${search}%` }
            );
        }

        if (isDefault !== undefined) {
            const isDefaultBool = String(isDefault).toLowerCase() === 'true';
            queryBuilder.andWhere('permission.isDefault = :isDefault', { isDefault: isDefaultBool });
        }

        if (sortBy) {
            queryBuilder.orderBy(`permission.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('permission.name', 'ASC');
        }

        return queryBuilder.getMany();
    }

    async findWithPagePagination(queryOptions: PermissionPageQueryDto) {
        const { page = 1, size = 10, search, sortBy, sortOrder, isDefault } = queryOptions;
        
        const queryBuilder = this.permissionRepository.createQueryBuilder('permission');
        
        if (search) {
            queryBuilder.where(
                'permission.code LIKE :search OR permission.name LIKE :search OR permission.description LIKE :search',
                { search: `%${search}%` }
            );
        }

        if (isDefault !== undefined) {
            const isDefaultBool = String(isDefault).toLowerCase() === 'true';
            queryBuilder.andWhere('permission.isDefault = :isDefault', { isDefault: isDefaultBool });
        }

        if (sortBy) {
            queryBuilder.orderBy(`permission.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('permission.name', 'ASC');
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        
        return {
            data,
            meta: {
                total,
                page,
                size,
                totalPages: Math.ceil(total / size)
            }
        };
    }
}
   