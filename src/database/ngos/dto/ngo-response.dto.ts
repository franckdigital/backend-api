import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { LocationResponseDto } from '../../locations/locations.dto';
import { ActivitySectorResponseDto } from '../../activity-sectors/activity-sectors.dto';
import { DisabilityTypeResponseDto } from '../../disability-types/disability-types.dto';

export class NgoResponseDto {
  @ApiProperty({ description: 'NGO unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID associated with NGO' })
  userId: string;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: 'NGO organization name' })
  organizationName: string;

  @ApiPropertyOptional({ description: 'NGO registration number' })
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'NGO tax number' })
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'NGO mission statement' })
  mission?: string;

  @ApiPropertyOptional({ description: 'NGO description' })
  description?: string;

  @ApiPropertyOptional({ description: 'NGO website URL' })
  website?: string;

  @ApiPropertyOptional({ description: 'NGO logo URL' })
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Founded date' })
  foundedDate?: Date;

  @ApiPropertyOptional({ description: 'Location ID where NGO is based' })
  locationId: string | null;

  @ApiPropertyOptional({ description: 'Location information', type: LocationResponseDto })
  location: LocationResponseDto | null;

  @ApiPropertyOptional({ description: 'Full address of NGO' })
  fullAddress?: string;

  @ApiPropertyOptional({ description: 'Service areas', type: [LocationResponseDto] })
  serviceAreas?: LocationResponseDto[];

  @ApiPropertyOptional({ description: 'Focus areas', type: [ActivitySectorResponseDto] })
  focusAreas?: ActivitySectorResponseDto[];

  @ApiPropertyOptional({ description: 'Supported disability types', type: [DisabilityTypeResponseDto] })
  supportedDisabilityTypes?: DisabilityTypeResponseDto[];

  @ApiPropertyOptional({ description: 'Primary contact person name' })
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email' })
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone' })
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Secondary contact person name' })
  secondaryContactName?: string;

  @ApiPropertyOptional({ description: 'Secondary contact email' })
  secondaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Secondary contact phone' })
  secondaryContactPhone?: string;

  @ApiProperty({ description: 'Total candidates supported' })
  totalCandidatesSupported: number;

  @ApiProperty({ description: 'Successful placements count' })
  successfulPlacements: number;

  @ApiProperty({ description: 'Number of active members' })
  activeMembers: number;

  @ApiProperty({ description: 'Number of staff' })
  staffCount: number;

  @ApiPropertyOptional({ description: 'Services offered' })
  servicesOffered?: string;

  @ApiProperty({ description: 'Provides job training' })
  providesJobTraining: boolean;

  @ApiProperty({ description: 'Provides career counseling' })
  providesCareerCounseling: boolean;

  @ApiProperty({ description: 'Provides legal support' })
  providesLegalSupport: boolean;

  @ApiProperty({ description: 'Provides healthcare support' })
  providesHealthcareSupport: boolean;

  @ApiProperty({ description: 'Is NGO verified' })
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Verification date' })
  verificationDate?: Date;

  @ApiPropertyOptional({ description: 'Verification notes' })
  verificationNotes?: string;

  @ApiProperty({ description: 'Is NGO active' })
  isActive: boolean;

  @ApiProperty({ description: 'Can support candidates' })
  canSupportCandidates: boolean;

  @ApiProperty({ description: 'Profile completion percentage' })
  profileCompletionPercentage: number;

  @ApiProperty({ description: 'Is profile complete' })
  isProfileComplete: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
} 