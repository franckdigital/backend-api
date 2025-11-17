import { Injectable, Inject, forwardRef, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto, UserPageQueryDto } from './dto/user-query.dto';
import { QueryService } from '../../common/services/query.service';
import { Permission } from '../entities/permission.entity';
import { UserPermissionsDto, UserPermissionsResponseDto } from './dto/user-permissions.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    private readonly queryService: QueryService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const user = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      contact: createUserDto.contact,
      secondaryContact: createUserDto.secondaryContact,
      sex: createUserDto.sex,
      birthDate: new Date(createUserDto.birthDate ? createUserDto.birthDate : ""),
      address: createUserDto.address,
      profession: createUserDto.profession,
      isActive: true,
      isEmailVerified: true,
      isVerified: true
    });

    if (createUserDto.password) {
      user.setPassword(createUserDto.password);
    }

    if (createUserDto.permissions && createUserDto.permissions.length > 0) {
      user.permissions = await this.permissionRepository.findByIds(createUserDto.permissions);
    }

    if (createUserDto.roles && createUserDto.roles.length > 0) {
      user.roles = await this.rolesService.findByIds(createUserDto.roles);
    } else {
      const defaultRole = await this.rolesService.getDefaultRole();
      if (defaultRole) {
        user.roles = [defaultRole];
      }
    }

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions']
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
      select: ['id', 'firstName', 'lastName', 'photoUrl', 'email', 'profession', 'contact', 'secondaryContact', 'sex', 'birthDate', 'address', 'password', 'refreshToken', 'isActive', 'isEmailVerified', 'permissions', 'createdAt', 'updatedAt']
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
      select: ['id', 'firstName', 'lastName', 'photoUrl', 'email', 'profession', 'contact', 'secondaryContact', 'sex', 'birthDate', 'address', 'password', 'refreshToken', 'magicLinkToken', 'magicLinkExpires', 'isActive', 'isEmailVerified', 'permissions', 'createdAt', 'updatedAt']
    });
  }

  async saveMagicLinkToken(userId: string, token: string, expires?: Date): Promise<void> {
    const expiryDate = expires || new Date(Date.now() + 30 * 60 * 1000); // Default 30 minutes
    await this.userRepository.update(
      { id: userId },
      {
        magicLinkToken: token,
        magicLinkExpires: expiryDate
      }
    );
  }

  async clearMagicLinkToken(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      {
        magicLinkToken: '',
        magicLinkExpires: undefined
      }
    );
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.setPassword(newPassword);
      // Clear the magic link token
      user.magicLinkToken = '';
      user.magicLinkExpires = undefined;
      // Mark that user has changed their password
      user.isFirstLogin = false;
      await this.userRepository.save(user);
    }
  }

  /**
   * Change a user's password after verifying their current password
   * @param userId The user ID
   * @param currentPassword The current password (for verification)
   * @param newPassword The new password to set
   * @returns true if successful, false otherwise
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Utilisez select: true pour s'assurer que le champ password est récupéré
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        isFirstLogin: true
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify the current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Set the new password
    user.setPassword(newPassword);

    // Mark that user has changed their password
    user.isFirstLogin = false;

    await this.userRepository.save(user);
    return true;
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      {
        isEmailVerified: true,
        magicLinkToken: '',
        magicLinkExpires: undefined
      }
    );
  }

  /**
   * Saves a refresh token for a user
   * @param userId The user ID
   * @param refreshToken The refresh token to save (or null to clear)
   * @returns The updated user
   */
  async saveRefreshToken(userId: string, refreshToken: string | null): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'refreshToken', 'refreshTokenExpires']
    });
    if (!user) return null;

    user.refreshToken = refreshToken || '';
    user.refreshTokenExpires = refreshToken
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : undefined;

    return this.userRepository.save(user);
  }

  /**
   * Records a failed login attempt for a user
   * @param userId The user ID
   * @returns The updated user with incremented failed login attempts
   */
  async recordFailedLoginAttempt(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    const maxAttempts = 5; // Configure as needed
    const lockoutMinutes = 15;

    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // If max attempts reached, lock the account
    if (user.failedLoginAttempts >= maxAttempts) {
      user.lockoutUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    }

    return this.userRepository.save(user);
  }

  /**
   * Resets the failed login attempts counter for a user
   * @param userId The user ID
   * @returns The updated user with reset login attempts
   */
  async resetFailedLoginAttempts(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;

    return this.userRepository.save(user);
  }

  // Direct Permission management
  async addPermissions(userId: string, dto: UserPermissionsDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const newPermissions = await this.permissionRepository.findByIds(dto.permissions);
    const existingPermissionIds = new Set(user.permissions?.map(p => p.id) || []);

    user.permissions = [
      ...(user.permissions || []),
      ...newPermissions.filter(p => !existingPermissionIds.has(p.id))
    ];

    return this.userRepository.save(user);
  }

  async removePermissions(userId: string, dto: UserPermissionsDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permissionsToRemove = new Set(dto.permissions);
    user.permissions = (user.permissions || []).filter(p => !permissionsToRemove.has(p.id));

    return this.userRepository.save(user);
  }

  async setPermissions(userId: string, dto: UserPermissionsDto): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user) {
      return null;
    }

    // Fetch the actual Permission entities from the database
    const permissions = await this.permissionRepository.findByIds(dto.permissions);
    user.permissions = permissions;

    return this.userRepository.save(user);
  }

  // Role-based user management
  async addRolesToUser(userId: string, roleIds: string[]): Promise<User | null> {
    if (roleIds.length === 0) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      return null;
    }

    const roles = await this.rolesService.findByIds(roleIds);
    if (!roles.length) {
      return user;
    }

    // Create a set of existing role IDs for quick lookup
    const existingRoleIds = new Set((user.roles || []).map(r => r.id));

    // Only add roles that don't already exist for the user
    const rolesToAdd = roles.filter(r => !existingRoleIds.has(r.id));
    if (rolesToAdd.length) {
      user.roles = [...(user.roles || []), ...rolesToAdd];
      await this.userRepository.save(user);
    }

    return user;
  }

  async removeRolesFromUser(userId: string, roleIds: string[]): Promise<User | null> {
    if (roleIds.length === 0) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user || !user.roles || user.roles.length === 0) {
      return user;
    }

    // Create a set of role IDs to remove for quick lookup
    const roleIdsToRemove = new Set(roleIds);

    // Filter out the roles that should be removed
    user.roles = user.roles.filter(r => !roleIdsToRemove.has(r.id));

    return this.userRepository.save(user);
  }

  async setUserRoles(userId: string, roleIds: string[]): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      return null;
    }

    if (roleIds.length === 0) {
      // Clear all roles
      user.roles = [];
    } else {
      // Fetch the roles and set them
      const roles = await this.rolesService.findByIds(roleIds);
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async getUserPermissions(userId: string): Promise<UserPermissionsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions', 'roles', 'roles.permissions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permissionCodes = new Set<string>();

    // Ajouter les permissions directes
    user.permissions?.forEach(permission => {
      permissionCodes.add(permission.code);
    });

    // Ajouter les permissions des rôles
    user.roles?.forEach(role => {
      role.permissions?.forEach(permission => {
        permissionCodes.add(permission.code);
      });
    });

    return {
      permissions: Array.from(permissionCodes)
    };
  }

  async updateProfile(userId: string, profileData: UpdateUserProfileDto): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });
    if (!user) {
      return null;
    }

    // Only allow updating specific fields
    const allowedFields = ['firstName', 'lastName', 'photoUrl', 'contact', 'secondaryContact', 'profession', 'sex', 'birthDate', 'address'];
    const fieldsToUpdate: Partial<User> = {};

    // Filter to only allowed fields
    for (const field of allowedFields) {
      if (field in profileData) {
        fieldsToUpdate[field] = profileData[field];
      }
    }

    // Special handling for password
    if ('password' in profileData && profileData.password) {
      user.setPassword(profileData.password);
      // Mark that user has changed their password
      user.isFirstLogin = false;
    }

    // Update the allowed fields
    Object.assign(user, fieldsToUpdate);

    // Update user roles if provided
    if (profileData.roles !== undefined) {
      if (profileData.roles.length === 0) {
        // Clear all roles
        user.roles = [];
      } else {
        // Fetch the roles and set them
        const roles = await this.rolesService.findByIds(profileData.roles);
        user.roles = roles;
      }
    }

    return this.userRepository.save(user);
  }

  /**
   * Find users with filters
   * Automatically excludes users with roles: "company", "ngo", "candidat"
   * @param queryOptions Query options for filtering
   * @returns Users without excluded roles
   */
  async findWithFilters(queryOptions: UserQueryDto = {}) {
    const { search, sortBy, sortOrder, roles } = queryOptions;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions');

    // Exclure les utilisateurs ayant des rôles avec les codes "company", "ngo", "candidat"
    const excludedRoleCodes = ['company', 'ngo', 'candidat'];
    queryBuilder.where(`user.id NOT IN (
      SELECT DISTINCT u.id 
      FROM users u 
      INNER JOIN user_roles ur ON u.id = ur.user_id 
      INNER JOIN roles r ON ur.role_id = r.id 
      WHERE r.code IN (:...excludedCodes)
    )`, { excludedCodes: excludedRoleCodes });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (roles && roles.length > 0) {
      queryBuilder.andWhere('roles.id IN (:...roles)', { roles });
    }

    if (sortBy) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('user.firstName', 'ASC');
    }

    return queryBuilder.getMany();
  }

  /**
   * Find users with page-based pagination
   * Automatically excludes users with roles: "company", "ngo", "candidat"
   * @param queryOptions Query options for pagination and filtering
   * @returns Paginated users without excluded roles
   */
  async findWithPagePagination(queryOptions: UserPageQueryDto) {
    const { page = 1, size = 10, search, sortBy, sortOrder, roles, role } = queryOptions;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions');

    // Exclure les utilisateurs ayant des rôles avec les codes "company", "ngo", "candidat"
    const excludedRoleCodes = ['company', 'ngo', 'candidat'];
    queryBuilder.where(`user.id NOT IN (
      SELECT DISTINCT u.id 
      FROM users u 
      INNER JOIN user_roles ur ON u.id = ur.user_id 
      INNER JOIN roles r ON ur.role_id = r.id 
      WHERE r.code IN (:...excludedCodes)
    )`, { excludedCodes: excludedRoleCodes });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Priorité au filtre 'role' au singulier s'il est fourni
    if (role) {
      queryBuilder.andWhere('roles.id = :role', { role });
    } else if (roles && roles.length > 0) {
      // Sinon, utiliser le filtre 'roles' au pluriel s'il est fourni
      queryBuilder.andWhere('roles.id IN (:...roles)', { roles });
    }

    if (sortBy) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('user.firstName', 'ASC');
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

  async activateUser(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isActive = true;
    return this.userRepository.save(user);
  }

  async deactivateUser(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

  async verifyUser(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    return this.userRepository.save(user);
  }

  async unverifyUser(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    user.isVerified = false;
    user.verifiedAt = null;
    return this.userRepository.save(user);
  }

  async assignPermissions(userId: string, dto: UserPermissionsDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permissions = await this.permissionRepository.findByIds(dto.permissions);
    user.permissions = permissions;

    return this.userRepository.save(user);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findByIds(ids);
  }
} 