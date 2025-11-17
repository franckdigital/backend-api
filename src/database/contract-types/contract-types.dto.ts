import { IsString, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PageQueryDto } from '../../common/dto/query-options.dto';

/**
 * DTO for creating a new contract type
 */
export class CreateContractTypeDto {
    @ApiProperty({
        description: 'Name of the contract type',
        example: 'Permanent Contract',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the contract type',
        example: 'Full-time permanent employment contract with unlimited duration'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the contract type is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Sort order for displaying contract types',
        example: 1,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Sort order must be a non-negative integer' })
    sortOrder?: number;
}

/**
 * DTO for updating an existing contract type
 */
export class UpdateContractTypeDto extends PartialType(CreateContractTypeDto) {
    @ApiPropertyOptional({
        description: 'Name of the contract type',
        example: 'Permanent Full-Time Contract',
        minLength: 2,
        maxLength: 100
    })
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
    name?: string;
}

/**
 * DTO for contract type response
 */
export class ContractTypeResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the contract type',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the contract type',
        example: 'Permanent Contract'
    })
    name: string;

    @ApiProperty({
        description: 'Description of the contract type',
        example: 'Full-time permanent employment contract with unlimited duration',
        nullable: true
    })
    description: string | null;

    @ApiProperty({
        description: 'Whether the contract type is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Sort order for displaying contract types',
        example: 1
    })
    sortOrder: number;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T12:00:00.000Z'
    })
    updatedAt: Date;
}

/**
 * DTO for paginated contract types query
 */
export class ContractTypePageQueryDto extends PageQueryDto {
    @ApiPropertyOptional({
        description: 'Search in name and description',
        example: 'permanent'
    })
    @IsOptional()
    @IsString()
    declare search?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}

/**
 * DTO for paginated contract types response
 */
export class PagedContractTypesResponseDto {
    @ApiProperty({
        description: 'Array of contract types',
        type: [ContractTypeResponseDto],
    })
    data: ContractTypeResponseDto[];

    @ApiProperty({
        description: 'Pagination metadata',
        example: {
            total: 8,
            page: 1,
            size: 10,
            totalPages: 1,
        },
    })
    meta: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
} 