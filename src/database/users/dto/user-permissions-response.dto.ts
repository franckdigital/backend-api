import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionsResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: 'uuid'
    })
    id: string;

    @ApiProperty({
        description: 'Array of permission UUIDs assigned to the user',
        type: [String],
        example: ['uuid1', 'uuid2']
    })
    permissions: string[];

    @ApiProperty({
        description: 'Timestamp of when the permissions were last updated',
        example: '2024-03-21T12:00:00Z'
    })
    updatedAt: Date;
} 