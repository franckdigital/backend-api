import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
    UseGuards,
    HttpStatus,
    Query
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsDto } from './dto/permissions.dto';
import { RoleResponseDto, PagedRolesResponseDto } from './dto/role-response.dto';
import { RoleQueryDto, RolePageQueryDto } from './dto/role-query.dto';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
// @UseGuards(PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @RequirePermissions('roles:read')
    @ApiOperation({ summary: 'Get all roles', description: 'Returns a list of all roles in the system' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of roles retrieved successfully',
        type: PagedRolesResponseDto
    })
    async findWithPagePagination(@Query() query: RolePageQueryDto) {
        return this.rolesService.findWithPagePagination(query);
    }

    @Get('all')
    @RequirePermissions('roles:read')
    @ApiOperation({ summary: 'Get all roles', description: 'Returns a list of all roles in the system' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of roles retrieved successfully',
        type: [RoleResponseDto]
    })
    async findAll(): Promise<Role[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @RequirePermissions('roles:view')
    @ApiOperation({ summary: 'Get a role by ID', description: 'Returns a single role by its ID' })
    @ApiParam({ name: 'id', description: 'The ID of the role to retrieve' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Role retrieved successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async findOne(@Param('id') id: string) {
        const role = await this.rolesService.findOne(id);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Post()
    @RequirePermissions('roles:create')
    @ApiOperation({ summary: 'Create a new role', description: 'Creates a new role with the provided data' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Role created successfully',
        type: RoleResponseDto
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async create(@Body() createRoleDto: CreateRoleDto) {
        try {
            return await this.rolesService.create(createRoleDto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Patch(':id')
    @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Update a role', description: 'Updates an existing role with the provided data' })
    @ApiParam({ name: 'id', description: 'The ID of the role to update' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Role updated successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto
    ) {
        const role = await this.rolesService.update(id, updateRoleDto);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Delete(':id')
    @RequirePermissions('roles:delete')
    @ApiOperation({ summary: 'Delete a role' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Role deleted successfully'
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.rolesService.remove(id);
    }

    @Patch(':id/permissions')
    @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Set role permissions', description: 'Replaces all permissions for a role' })
    @ApiParam({ name: 'id', description: 'The ID of the role to update permissions for' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Permissions updated successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async setPermissions(
        @Param('id') id: string,
        @Body() body: PermissionsDto
    ) {
        const role = await this.rolesService.setPermissions(id, body.permissions);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Patch(':id/permissions/add')
    @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Add role permissions', description: 'Adds new permissions to a role' })
    @ApiParam({ name: 'id', description: 'The ID of the role to add permissions to' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Permissions added successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async addPermissions(
        @Param('id') id: string,
        @Body() body: PermissionsDto
    ) {
        const role = await this.rolesService.addPermissions(id, body.permissions);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Patch(':id/permissions/remove')
    @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Remove role permissions', description: 'Removes permissions from a role' })
    @ApiParam({ name: 'id', description: 'The ID of the role to remove permissions from' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Permissions removed successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async removePermissions(
        @Param('id') id: string,
        @Body() body: PermissionsDto
    ) {
        const role = await this.rolesService.removePermissions(id, body.permissions);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Get('paged')
    @RequirePermissions('roles:view')
    @ApiOperation({
        summary: 'Get all roles with page-based pagination',
        description: 'Returns a paginated list of roles using standard page and size parameters'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Roles retrieved successfully',
        type: PagedRolesResponseDto
    })
    async findAllPaged(@Query() query: RolePageQueryDto) {
        return this.rolesService.findWithPagePagination(query);
    }

    @Post(':id/users')
    @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Add users to a role' })
    @ApiParam({ name: 'id', description: 'The ID of the role to add users to' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users added successfully',
        type: RoleResponseDto
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async addUsers(
        @Param('id') id: string,
        @Body() body: { users: string[] }
    ) {
        const role = await this.rolesService.addUsers(id, body.users);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    @Get(':id/users')
    @RequirePermissions('roles:view')
    @ApiOperation({ summary: 'Get users in a role' })
    @ApiParam({ name: 'id', description: 'The ID of the role to get users from' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users retrieved successfully',
        type: [RoleResponseDto]
    })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async findUsers(@Param('id') id: string) {
        const role = await this.rolesService.findUsers(id);
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
} 