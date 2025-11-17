import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ActionResponseDto {
    @ApiProperty({ description: 'UUID of the action' })
    id: string;

    @ApiProperty({ description: 'Name of the action' })
    name: string;

    @ApiProperty({ description: 'Code of the action' })
    code: string;

    @ApiProperty({ description: 'Whether the action is active' })
    isActive: boolean;
}

class MenuResponseDto {
    @ApiProperty({ description: 'UUID of the menu' })
    id: string;

    @ApiProperty({ description: 'Name of the menu' })
    name: string;

    @ApiProperty({ description: 'Code of the menu' })
    code: string;

    @ApiPropertyOptional({ description: 'Description of the menu' })
    description?: string;

    @ApiPropertyOptional({ description: 'Icon for the menu' })
    icon?: string;

    @ApiPropertyOptional({ description: 'Path for the menu' })
    path?: string;

    @ApiProperty({ description: 'Order of the menu item' })
    order: number;

    @ApiProperty({ description: 'Whether the menu is active' })
    isActive: boolean;
}

export class PermissionResponseDto {
    @ApiProperty({ description: 'UUID of the permission' })
    id: string;

    @ApiProperty({ description: 'Name of the permission' })
    name: string;

    @ApiProperty({ description: 'Code of the permission' })
    code: string;

    @ApiPropertyOptional({ description: 'Description of the permission' })
    description?: string;

    @ApiProperty({ description: 'Whether the permission is active' })
    isActive: boolean;

    @ApiProperty({ description: 'Whether this is a system permission' })
    isSystem: boolean;

    @ApiProperty({ description: 'List of available actions for this permission', type: [String] })
    actions: string[];
}

export class RoleResponseDto {
    @ApiProperty({ description: 'UUID of the role' })
    id: string;

    @ApiProperty({ description: 'Name of the role' })
    name: string;

    @ApiProperty({ description: 'Code of the role' })
    code: string;

    @ApiPropertyOptional({ description: 'Description of the role' })
    description?: string;

    @ApiProperty({ description: 'Whether this is the default role' })
    isDefault: boolean;

    @ApiProperty({ description: 'Whether this is a system role' })
    isSystem: boolean;

    @ApiProperty({ description: 'List of permissions assigned to this role', type: [PermissionResponseDto] })
    permissions: PermissionResponseDto[];

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;
}

export class PaginatedRolesResponseDto {
    @ApiProperty({
        description: 'Array of roles',
        type: [RoleResponseDto],
    })
    data: RoleResponseDto[];

    @ApiPropertyOptional({
        description: 'Cursor for the next page of results',
        example: '60d21b4667d0d8992e610c85',
    })
    nextCursor: string | null;

    @ApiProperty({
        description: 'Total number of roles matching the query (without pagination)',
        example: 10,
    })
    total: number;
}

export class PagedRolesResponseDto {
    @ApiProperty({ description: 'List of roles', type: [RoleResponseDto] })
    items: RoleResponseDto[];

    @ApiProperty({ description: 'Total number of roles' })
    total: number;

    @ApiProperty({ description: 'Current page number' })
    page: number;

    @ApiProperty({ description: 'Number of items per page' })
    limit: number;
} 