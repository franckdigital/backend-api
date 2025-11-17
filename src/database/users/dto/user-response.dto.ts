import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dto/role-response.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'The contact number of the user',
    example: '+1234567890',
  })
  contact?: string;

  @ApiPropertyOptional({
    description: 'The secondary contact number of the user',
    example: '+0987654321',
  })
  secondaryContact?: string;

  @ApiPropertyOptional({
    description: 'The sex of the user',
    example: 'Male',
  })
  sex?: string;

  @ApiPropertyOptional({
    description: 'The birth date of the user',
    example: '1990-01-01',
  })
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'The address of the user',
    example: '123 Main St, City, Country',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'The profession of the user',
    example: 'Software Engineer',
  })
  profession?: string;

  @ApiPropertyOptional({
    description: 'The photo URL of the user',
    example: 'https://example.com/photo.jpg',
  })
  photoUrl?: string;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates if the user email is verified',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'The creation date of the user',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the user',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiPropertyOptional({
    description: 'Cursor for the next page of results',
    example: '60d21b4667d0d8992e610c85',
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Total number of users matching the query (without pagination)',
    example: 42,
  })
  total: number;
}

export class PagedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total number of users matching the query',
    example: 42,
  })
  totalItems: number;
} 