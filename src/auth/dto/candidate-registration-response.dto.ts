import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CandidateRegistrationResponseDto {
  @ApiProperty({
    description: 'Candidate ID',
    example: 'uuid-candidate-id',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-user-id',
  })
  userId: string;

  @ApiProperty({
    description: 'Registration success message',
    example: 'Registration successful. You are now logged in.',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Refresh token for token renewal',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'User information',
    type: Object,
    example: {
      id: 'uuid-user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      userType: 'candidate',
      isActive: true,
      isEmailVerified: false,
      isVerified: false,
      createdAt: '2024-01-15T10:00:00Z',
    },
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    contact?: string;
    secondaryContact?: string;
    sex?: string;
    birthDate?: Date;
    address?: string;
    profession?: string;
    photoUrl?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isVerified: boolean;
    isFirstLogin: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({
    description: 'Disability type ID',
    example: 'uuid-disability-type-id',
  })
  disabilityTypeId: string;

  @ApiPropertyOptional({
    description: 'Disability description',
    example: 'Mobility impairment affecting lower limbs',
  })
  disabilityDescription?: string;

  @ApiPropertyOptional({
    description: 'Disability percentage',
    example: 75,
  })
  disabilityPercentage?: number;

  @ApiPropertyOptional({
    description: 'Education level ID',
    example: 'uuid-education-level-id',
  })
  educationLevelId?: string;

  @ApiPropertyOptional({
    description: 'Experience level ID',
    example: 'uuid-experience-level-id',
  })
  experienceLevelId?: string;

  @ApiPropertyOptional({
    description: 'Professional summary',
    example: 'Experienced software developer with expertise in web technologies',
  })
  professionalSummary?: string;

  @ApiPropertyOptional({
    description: 'Skills JSON string',
    example: '["JavaScript", "TypeScript", "React", "Node.js"]',
  })
  skills?: string;

  @ApiPropertyOptional({
    description: 'Languages JSON string',
    example: '[{"name": "English", "level": "Native"}, {"name": "French", "level": "Fluent"}]',
  })
  languages?: string;

  @ApiPropertyOptional({
    description: 'Location ID',
    example: 'uuid-location-id',
  })
  locationId?: string;

  @ApiPropertyOptional({
    description: 'CV file URL',
    example: '/storage/candidates/cv-files/uuid-filename.pdf',
  })
  cvFileUrl?: string;

  @ApiPropertyOptional({
    description: 'Profile photo URL',
    example: '/storage/candidates/profile-photos/uuid-filename.jpg',
  })
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Video presentation URL',
    example: '/storage/candidates/videos/uuid-filename.mp4',
  })
  videoPresentation?: string;

  @ApiPropertyOptional({
    description: 'Biography',
    example: 'Passionate about technology and helping others through accessible solutions.',
  })
  biography?: string;

  @ApiPropertyOptional({
    description: 'Expected minimum salary',
    example: 500000,
  })
  expectedSalaryMin?: number;

  @ApiPropertyOptional({
    description: 'Expected maximum salary',
    example: 750000,
  })
  expectedSalaryMax?: number;

  @ApiPropertyOptional({
    description: 'Availability date',
    example: '2024-02-01',
  })
  availabilityDate?: Date;

  @ApiProperty({
    description: 'Profile completion percentage',
    example: 58,
  })
  profileCompletionPercentage: number;

  @ApiProperty({
    description: 'Whether profile is complete',
    example: false,
  })
  isProfileComplete: boolean;

  @ApiProperty({
    description: 'Whether candidate is available for opportunities',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Whether candidate profile is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Candidate creation timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Candidate last update timestamp',
    example: '2024-01-15T10:00:00Z',
  })
  updatedAt: Date;
} 