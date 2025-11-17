import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionQueryDto, PermissionPageQueryDto } from './dto/permission-query.dto';
import { Permission } from '../entities/permission.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('permissions')
@Controller('permissions')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Post()
    @RequirePermissions('permissions:create')
    @ApiOperation({ summary: 'Create a new permission' })
    @ApiResponse({ status: 201, description: 'The permission has been successfully created.', type: Permission })
    create(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
        return this.permissionsService.create(createPermissionDto);
    }

    @Get('all')
    @RequirePermissions('permissions:read')
    @ApiOperation({ summary: 'Get all permissions' })
    @ApiResponse({ status: 200, description: 'Return all permissions.', type: [Permission] })
    findAll(@Query() queryOptions: PermissionQueryDto): Promise<Permission[]> {
        return this.permissionsService.findWithFilters(queryOptions);
    }

    @Get()
    @RequirePermissions('permissions:read')
    @ApiOperation({ summary: 'Get paginated permissions' })
    @ApiResponse({ status: 200, description: 'Return paginated permissions.', type: PaginatedResponseDto })
    findWithPagination(@Query() queryOptions: PermissionPageQueryDto): Promise<PaginatedResponseDto<Permission>> {
        return this.permissionsService.findWithPagePagination(queryOptions);
    }

    @Get(':id')
    @RequirePermissions('permissions:read')
    @ApiOperation({ summary: 'Get a permission by id' })
    @ApiResponse({ status: 200, description: 'Return the permission.', type: Permission })
    findOne(@Param('id') id: string): Promise<Permission> {
        return this.permissionsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('permissions:update')
    @ApiOperation({ summary: 'Update a permission' })
    @ApiResponse({ status: 200, description: 'The permission has been successfully updated.', type: Permission })
    update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        return this.permissionsService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    @RequirePermissions('permissions:delete')
    @ApiOperation({ summary: 'Delete a permission' })
    @ApiResponse({ status: 200, description: 'The permission has been successfully deleted.' })
    remove(@Param('id') id: string): Promise<any> {
        return this.permissionsService.remove(id);
    }
} 