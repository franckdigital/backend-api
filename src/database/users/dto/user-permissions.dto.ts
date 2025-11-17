import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionsDto {
    @ApiProperty({
        description: 'Array of permission UUIDs',
        type: [String],
        example: ['uuid1', 'uuid2']
    })
    @IsArray()
    @IsUUID('4', { each: true })
    permissions: string[];
}

export class UserPermissionsResponseDto {
    @ApiProperty({
        description: 'Array of permission codes',
        type: [String],
        example: ['read:users', 'create:users']
    })
    permissions: string[];
} 