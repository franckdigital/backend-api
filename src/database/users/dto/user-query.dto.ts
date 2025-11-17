import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryOptionsDto, PageQueryDto } from '../../../common/dto/query-options.dto';

export class UserQueryDto extends QueryOptionsDto {
    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: 'true',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by email verification status',
        example: 'true',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isEmailVerified?: boolean;
    
    @ApiPropertyOptional({
        description: 'Filter by role IDs',
        example: ['6123456789abcdef12345678', '6123456789abcdef12345679'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    roles?: string[];
}

export class UserPageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: 'true',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by email verification status',
        example: 'true',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isEmailVerified?: boolean;
    
    @ApiPropertyOptional({
        description: 'Filter by role IDs (multiple roles)',
        example: ['6123456789abcdef12345678', '6123456789abcdef12345679'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    roles?: string[];
    
    @ApiPropertyOptional({
        description: 'Filter by a single role ID',
        example: '6123456789abcdef12345678',
        type: String,
    })
    @IsOptional()
    @IsUUID('4')
    role?: string;
} 