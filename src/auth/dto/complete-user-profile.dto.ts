import { ApiProperty } from '@nestjs/swagger';

export class CompleteUserProfileDto {
  @ApiProperty({
    description: 'User basic information',
    example: {
      id: 'uuid-user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      contact: '+237123456789',
      userType: 'candidate',
      isActive: true,
      isEmailVerified: true
    }
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contact?: string;
    secondaryContact?: string;
    sex?: string;
    birthDate?: Date;
    address?: string;
    profession?: string;
    userType: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isVerified: boolean;
    photoUrl?: string;
    roles?: any[];
    permissions?: any[];
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({
    description: 'Candidate profile information (if user is a candidate)',
    required: false,
    example: {
      id: 'uuid-candidate-id',
      disabilityType: { id: 'uuid', name: 'Visual impairment' },
      disabilityDescription: 'Partial vision loss',
      educationLevel: { id: 'uuid', name: 'Bachelor degree' },
      experienceLevel: { id: 'uuid', name: '2-5 years' },
      professionalSummary: 'Experienced developer...',
      skills: '["JavaScript", "TypeScript"]',
      expectedSalaryMin: 500000,
      expectedSalaryMax: 750000,
      isAvailable: true
    }
  })
  candidate?: any;

  @ApiProperty({
    description: 'Company profile information (if user created a company)',
    required: false,
    example: {
      id: 'uuid-company-id',
      companyName: 'Tech Solutions SARL',
      registrationNumber: 'RCCM123456789',
      description: 'Technology consulting company',
      website: 'https://techsolutions.com',
      activitySector: { id: 'uuid', name: 'Information Technology' },
      companySize: { id: 'uuid', name: '50-99 employees' },
      exactEmployeeCount: 75,
      isVerified: true
    }
  })
  company?: any;

  @ApiProperty({
    description: 'NGO profile information (if user created an NGO)',
    required: false,
    example: {
      id: 'uuid-ngo-id',
      organizationName: 'Hope for Disabled Association',
      registrationNumber: 'NGO-2024-001',
      mission: 'Supporting people with disabilities',
      description: 'Non-profit organization...',
      website: 'https://hope-disabled.org',
      focusAreas: [{ id: 'uuid', name: 'Social Services' }],
      supportedDisabilityTypes: [{ id: 'uuid', name: 'All types' }],
      isVerified: true
    }
  })
  ngo?: any;

  @ApiProperty({
    description: 'Profile completion summary',
    example: {
      hasCandidate: true,
      hasCompany: false,
      hasNgo: false,
      overallCompletionPercentage: 85
    }
  })
  profileSummary: {
    hasCandidate: boolean;
    hasCompany: boolean;
    hasNgo: boolean;
    overallCompletionPercentage: number;
  };
} 