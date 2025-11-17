import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsUrl, IsDate, IsBoolean, IsArray, IsUUID, IsDateString } from 'class-validator';

export class UpdateUserProfileDto {
    @ApiPropertyOptional({
        description: 'The first name of the user',
        example: 'John'
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({
        description: 'The last name of the user',
        example: 'Doe'
    })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({
        description: 'The email of the user',
        example: 'john.doe@example.com'
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'The contact number of the user',
        example: '+1234567890'
    })
    @IsOptional()
    @IsString()
    contact?: string;

    @ApiPropertyOptional({
        description: 'The secondary contact number of the user',
        example: '+1234567891'
    })
    @IsOptional()
    @IsString()
    secondaryContact?: string;

    @ApiPropertyOptional({
        description: 'The sex of the user',
        example: 'Male'
    })
    @IsOptional()
    @IsString()
    sex?: string;

    @ApiPropertyOptional({
        description: 'The birth date of the user',
        example: '1990-01-01'
    })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({
        description: 'The address of the user',
        example: '123 Main St, City, Country'
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'The profession of the user',
        example: 'Software Engineer'
    })
    @IsOptional()
    @IsString()
    profession?: string;

    @ApiPropertyOptional({
        description: 'The password of the user',
        example: 'strongPassword123'
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional({
        description: 'URL of the user\'s profile photo',
        example: 'https://example.com/photos/user.jpg'
    })
    @IsOptional()
    @IsUrl()
    photoUrl?: string;

    @ApiPropertyOptional({
        description: 'Whether the user account is active',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Les rôles attribués à l\'utilisateur',
        example: ['uuid1', 'uuid2'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    roles?: string[];
} 