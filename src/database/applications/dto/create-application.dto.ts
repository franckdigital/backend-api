import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsUrl } from 'class-validator';

export class CreateApplicationDto {
    @ApiProperty({
        description: 'The ID of the job offer',
        example: 'uuid-string',
    })
    @IsUUID()
    @IsNotEmpty()
    jobOfferId: string;

    @ApiProperty({
        description: 'The ID of the candidate applying',
        example: 'uuid-string',
    })
    @IsUUID()
    @IsNotEmpty()
    candidateId: string;

    @ApiPropertyOptional({
        description: 'The ID of the supporting NGO if any',
        example: 'uuid-string',
    })
    @IsOptional()
    @IsUUID()
    supportingNgoId?: string;

    @ApiPropertyOptional({
        description: 'Cover letter for the application',
        example: 'Dear Hiring Manager...',
    })
    @IsOptional()
    @IsString()
    coverLetter?: string;

    @ApiPropertyOptional({
        description: 'Motivation letter for the application (text content or file URL if uploaded as file)',
        example: 'I am writing to express my interest... or https://storage.example.com/motivation-letter.pdf',
    })
    @IsOptional()
    @IsString()
    motivationLetter?: string;

    @ApiPropertyOptional({
        description: 'Additional notes for the application',
        example: 'Additional information about the candidate...',
    })
    @IsOptional()
    @IsString()
    additionalNotes?: string;

    @ApiPropertyOptional({
        description: 'URL to the CV file',
        example: 'https://storage.example.com/cv.pdf',
    })
    @IsOptional()
    @IsUrl()
    cvFileUrl?: string;

    @ApiPropertyOptional({
        description: 'URL to the portfolio',
        example: 'https://portfolio.example.com',
    })
    @IsOptional()
    @IsUrl()
    portfolioUrl?: string;

    @ApiPropertyOptional({
        description: 'JSON string array of additional document URLs',
        example: '["https://storage.example.com/doc1.pdf", "https://storage.example.com/doc2.pdf"]',
    })
    @IsOptional()
    @IsString()
    attachmentUrls?: string;

    @ApiPropertyOptional({
        description: 'Special accommodation requests',
        example: 'Wheelchair accessibility required',
    })
    @IsOptional()
    @IsString()
    accommodationRequests?: string;

    @ApiPropertyOptional({
        description: 'Whether the candidate needs accessibility support',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    needsAccessibilitySupport?: boolean;

    @ApiPropertyOptional({
        description: 'Whether the candidate needs transport support',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    needsTransportSupport?: boolean;

    @ApiPropertyOptional({
        description: 'Whether the candidate needs interpreter support',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    needsInterpreterSupport?: boolean;

    @ApiPropertyOptional({
        description: 'Consent to share information with NGO',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    consentToShare?: boolean;

    @ApiPropertyOptional({
        description: 'Consent for follow-up communications',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    consentToFollow?: boolean;
} 