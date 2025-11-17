import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../database/users/dto/user-response.dto';
import { NgoResponseDto } from '../../database/ngos/dto/ngo-response.dto';

export class NgoRegistrationResponseDto {
  @ApiProperty({ description: 'Registration success status' })
  success: boolean;

  @ApiProperty({ description: 'User account information', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: 'NGO profile information', type: NgoResponseDto })
  ngo: NgoResponseDto;

  @ApiProperty({ description: 'Generated password (if not provided)' })
  generatedPassword?: string;

  @ApiProperty({ description: 'Registration completion message' })
  message: string;

  @ApiProperty({ description: 'Account verification status' })
  isEmailVerificationRequired: boolean;
} 