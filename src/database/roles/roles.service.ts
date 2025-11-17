import { Injectable, NotFoundException, ConflictException, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';
import { RoleQueryDto, RolePageQueryDto } from './dto/role-query.dto';
import { QueryService } from '../../common/services/query.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        @Inject(forwardRef(() => PermissionsService)) private permissionsService: PermissionsService,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        private readonly queryService: QueryService
    ) { }

    async onModuleInit() {
        await this.createDefaultRoles();
    }

    private async createDefaultRoles() {
        const defaultRoles = [
            {
                name: 'Super Administrateur',
                code: 'super-admin',
                description: 'Super administrateur avec tous les droits',
                isSystem: true,
                isDefault: false
            },
            {
                name: 'Administrateur',
                code: 'admin',
                description: 'Administrateur de la coopérative',
                isSystem: true,
                isDefault: false
            },
            {
                name: 'Membre',
                code: 'membre',
                description: 'Rôle de base pour les membres de la coopérative',
                isSystem: true,
                isDefault: true
            }
        ];

        for (const role of defaultRoles) {
            const existingRole = await this.roleRepository.findOne({ where: { code: role.code } });
            if (!existingRole) {
                const newRole = this.roleRepository.create(role);
                await this.roleRepository.save(newRole);
            }
        }
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        // Check if role with same code exists
        const existingRole = await this.roleRepository.findOne({
            where: { code: createRoleDto.code }
        });

        if (existingRole) {
            throw new ConflictException(`Role with code ${createRoleDto.code} already exists`);
        }

        // If this role is set as default, unset default flag on all other roles
        if (createRoleDto.isDefault) {
            await this.roleRepository.update(
                { isDefault: true },
                { isDefault: false }
            );
        }

        const role = this.roleRepository.create({
            name: createRoleDto.name,
            code: createRoleDto.code,
            description: createRoleDto.description,
            isDefault: createRoleDto.isDefault || false,
        });

        // If permissionIds are provided, fetch the permissions and add them
        if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
            const permissions = await this.permissionRepository.findBy({ id: In(createRoleDto.permissionIds) });
            role.permissions = permissions;
        }

        return this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return this.roleRepository.find({
            relations: ['permissions']
        });
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions']
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        return role;
    }

    async findByKey(key: string): Promise<Role | null> {
        return this.roleRepository.findOne({ 
            where: { code: key },
            relations: ['permissions']
        });
    }

    async findByIds(ids: string[]): Promise<Role[]> {
        if (!ids.length) return [];
        return this.roleRepository.find({ 
            where: { id: In(ids) },
            relations: ['permissions']
        });
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);

        // If role is system, prevent modification of certain fields
        if (role.isSystem) {
            delete updateRoleDto.code;
            delete updateRoleDto.isSystem;
        }

        // If this role is set as default, unset default flag on all other roles
        if (updateRoleDto.isDefault) {
            await this.roleRepository.update(
                { isDefault: true, id: Not(id) },
                { isDefault: false }
            );
        }

        // Update role properties
        Object.assign(role, updateRoleDto);

        // If permissionIds are provided, update the permissions
        if (updateRoleDto.permissionIds) {
            const permissions = await this.permissionRepository.findBy({ id: In(updateRoleDto.permissionIds) });
            role.permissions = permissions;
        }

        return this.roleRepository.save(role);
    }

    async remove(id: string): Promise<void> {
        const role = await this.findOne(id);

        if (role.isSystem) {
            throw new ConflictException('Cannot delete a system role');
        }

        await this.roleRepository.remove(role);
    }

    async getDefaultRole(): Promise<Role | null> {
        return this.roleRepository.findOne({ 
            where: { isDefault: true },
            relations: ['permissions']
        });
    }

    async addPermissions(id: string, permissionCodes: string[]): Promise<Role | null> {
        const role = await this.roleRepository.findOne({ 
            where: { id },
            relations: ['permissions']
        });

        if (!role) {
            return null;
        }

        // Get current permission IDs to avoid duplicates
        const currentPermissionIds = role.permissions.map(p => p.id);
        
        // Find permissions by code instead of by ID
        const permissions = await this.permissionRepository.findBy({ code: In(permissionCodes) });
        
        // Filter out permissions that are already on the role
        const newPermissions = permissions.filter(p => !currentPermissionIds.includes(p.id));
        
        role.permissions = [...role.permissions, ...newPermissions];

        return this.roleRepository.save(role);
    }

    async removePermissions(id: string, permissionCodes: string[]): Promise<Role | null> {
        const role = await this.roleRepository.findOne({ 
            where: { id },
            relations: ['permissions']
        });

        if (!role) {
            return null;
        }
        
        // Find permissions by code instead of filtering directly
        const permissions = await this.permissionRepository.findBy({ code: In(permissionCodes) });
        const permissionIdsToRemove = permissions.map(p => p.id);
        
        role.permissions = role.permissions.filter(p => !permissionIdsToRemove.includes(p.id));
        return this.roleRepository.save(role);
    }

    async setPermissions(id: string, permissionCodes: string[]): Promise<Role | null> {
        const role = await this.roleRepository.findOne({ 
            where: { id },
            relations: ['permissions']
        });

        if (!role) {
            return null;
        }

        // Find permissions by code instead of by ID
        const permissions = await this.permissionRepository.findBy({ code: In(permissionCodes) });

        role.permissions = permissions;

        return this.roleRepository.save(role);
    }

    async findWithFilters(queryOptions: RoleQueryDto = {}) {
        const { search, sortBy, sortOrder, isSystem, isDefault } = queryOptions;
        
        const queryBuilder = this.roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permissions');
        
        if (search) {
            queryBuilder.where(
                'role.code LIKE :search OR role.name LIKE :search OR role.description LIKE :search',
                { search: `%${search}%` }
            );
        }

        if (isSystem !== undefined) {
            const isSystemBool = String(isSystem).toLowerCase() === 'true';
            queryBuilder.andWhere('role.isSystem = :isSystem', { isSystem: isSystemBool });
        }

        if (isDefault !== undefined) {
            const isDefaultBool = String(isDefault).toLowerCase() === 'true';
            queryBuilder.andWhere('role.isDefault = :isDefault', { isDefault: isDefaultBool });
        }

        if (sortBy) {
            queryBuilder.orderBy(`role.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('role.name', 'ASC');
        }

        return queryBuilder.getMany();
    }

    async findWithPagePagination(queryOptions: RolePageQueryDto) {
        const { page = 1, size = 10, search, sortBy, sortOrder, isSystem, isDefault } = queryOptions;
        
        const queryBuilder = this.roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permissions');
        
        if (search) {
            queryBuilder.where(
                'role.code LIKE :search OR role.name LIKE :search OR role.description LIKE :search',
                { search: `%${search}%` }
            );
        }

        if (isSystem !== undefined) {
            const isSystemBool = String(isSystem).toLowerCase() === 'true';
            queryBuilder.andWhere('role.isSystem = :isSystem', { isSystem: isSystemBool });
        }

        if (isDefault !== undefined) {
            const isDefaultBool = String(isDefault).toLowerCase() === 'true';
            queryBuilder.andWhere('role.isDefault = :isDefault', { isDefault: isDefaultBool });
        }

        if (sortBy) {
            queryBuilder.orderBy(`role.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
        } else {
            queryBuilder.orderBy('role.name', 'ASC');
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

    async addUsers(id: string, userIds: string[]): Promise<Role | null> {
        const role = await this.roleRepository.findOne({ 
            where: { id },
            relations: ['users']
        });

        if (!role) {
            return null;
        }

        const users = await this.userRepository.findBy({ id: In(userIds) });
        role.users = [...role.users, ...users];

        return this.roleRepository.save(role);
    }

    async findUsers(id: string): Promise<Role | null> {
        return this.roleRepository.findOne({ 
            where: { id },
            relations: ['users']
        });
    }
} 