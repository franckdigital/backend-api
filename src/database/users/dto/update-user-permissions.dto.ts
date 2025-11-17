import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateUserPermissionsDto {
    @ApiProperty({
        description: 'Array of permission UUIDs to assign to the user',
        type: [String],
        example: ['uuid1', 'uuid2']
    })
    @IsArray()
    @IsUUID('4', { each: true })
    permissions: string[];
} 