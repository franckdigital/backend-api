import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export class CreateUserWithPhotoDto {
    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false, example: 'password123' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiPropertyOptional({
        required: false,
        enum: UserRole,
        example: UserRole.USER
    })
    @IsOptional()
    role?: UserRole;

    @ApiProperty({ required: false, type: [String], example: ['60a1b456c95f2c0012345678'] })
    @IsOptional()
    roles?: string[];

    @ApiProperty({ required: false, type: [String], example: ['read:users', 'update:own'] })
    @IsOptional()
    permissions?: string[];

    // The photo file will be handled by the controller's file interceptor
} 