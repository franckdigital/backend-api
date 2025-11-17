import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../database/users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'The authenticated user',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

export class UserRegistrationResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User type',
    example: 'candidate',
  })
  userType: string;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether email is verified',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Registration success message',
    example: 'Registration successful. Please check your email to verify your account.',
  })
  message: string;
}

export class MagicLinkResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Magic link sent to your email',
  })
  message: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset instructions sent to your email',
  })
  message: string;
} 