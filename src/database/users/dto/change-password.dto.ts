import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentPassword123'
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password to set for the user',
    example: 'newSecurePassword456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
