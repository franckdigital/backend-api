import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Application } from '../../entities/application.entity';
import { JobOffer } from '../../entities/job-offer.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Ngo } from '../../entities/ngo.entity';

export class ApplicationResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  jobOfferId: string;

  @ApiProperty({ example: 'uuid-string' })
  candidateId: string;

  @ApiPropertyOptional({ example: 'uuid-string' })
  supportingNgoId?: string;

  @ApiPropertyOptional({ example: 'Dear Hiring Manager...' })
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'I am writing to express my interest...' })
  motivationLetter?: string;

  @ApiPropertyOptional({ example: 'Additional information...' })
  additionalNotes?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/cv.pdf' })
  cvFileUrl?: string;

  @ApiPropertyOptional({ example: 'https://portfolio.example.com' })
  portfolioUrl?: string;

  @ApiPropertyOptional({ example: '["https://storage.example.com/doc1.pdf"]' })
  attachmentUrls?: string;

  @ApiProperty({ 
    example: 'submitted',
    enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'withdrawn']
  })
  status: string;

  @ApiPropertyOptional({ example: 'Candidate meets requirements' })
  statusNotes?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  lastStatusUpdate?: Date;

  @ApiPropertyOptional({ example: '2024-01-20T14:00:00Z' })
  interviewScheduledAt?: Date;

  @ApiPropertyOptional({ example: 'Company Office, Room 205' })
  interviewLocation?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  interviewMeetingUrl?: string;

  @ApiPropertyOptional({ example: 'Please bring portfolio and references' })
  interviewNotes?: string;

  @ApiPropertyOptional({ example: 4 })
  interviewRating?: number;

  @ApiPropertyOptional({ example: 'Impressive qualifications' })
  employerFeedback?: string;

  @ApiPropertyOptional({ example: 'Great experience during interview' })
  candidateFeedback?: string;

  @ApiPropertyOptional({ example: 'Strong support provided' })
  ngoFeedback?: string;

  @ApiPropertyOptional({ example: 'Wheelchair accessibility required' })
  accommodationRequests?: string;

  @ApiProperty({ example: false })
  needsAccessibilitySupport: boolean;

  @ApiProperty({ example: false })
  needsTransportSupport: boolean;

  @ApiProperty({ example: false })
  needsInterpreterSupport: boolean;

  @ApiPropertyOptional({ example: '2024-01-16T09:00:00Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-18T11:00:00Z' })
  shortlistedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-20T14:30:00Z' })
  interviewedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-22T16:00:00Z' })
  finalDecisionAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-19T10:00:00Z' })
  withdrawnAt?: Date;

  @ApiPropertyOptional({ example: 50000.00 })
  offeredSalary?: number;

  @ApiPropertyOptional({ example: 'Full-time, permanent position with benefits' })
  contractTerms?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  proposedStartDate?: Date;

  @ApiProperty({ example: false })
  isHired: boolean;

  @ApiPropertyOptional({ example: '2024-02-01' })
  hiredDate?: Date;

  @ApiPropertyOptional({ example: '[]' })
  communicationHistory?: string;

  @ApiProperty({ example: 0 })
  emailsSent: number;

  @ApiProperty({ example: 0 })
  callsMade: number;

  @ApiPropertyOptional({ example: 2 })
  daysToResponse?: number;

  @ApiPropertyOptional({ example: 7 })
  daysToDecision?: number;

  @ApiProperty({ example: true })
  consentToShare: boolean;

  @ApiProperty({ example: true })
  consentToFollow: boolean;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional()
  jobOffer?: Partial<JobOffer>;

  @ApiPropertyOptional()
  candidate?: Partial<Candidate>;

  @ApiPropertyOptional()
  supportingNgo?: Partial<Ngo>;

  constructor(application: Application, includeRelations = false) {
    this.id = application.id;
    this.jobOfferId = application.jobOfferId;
    this.candidateId = application.candidateId;
    this.supportingNgoId = application.supportingNgoId;
    this.coverLetter = application.coverLetter;
    this.motivationLetter = application.motivationLetter;
    this.additionalNotes = application.additionalNotes;
    this.cvFileUrl = application.cvFileUrl;
    this.portfolioUrl = application.portfolioUrl;
    this.attachmentUrls = application.attachmentUrls;
    this.status = application.status;
    this.statusNotes = application.statusNotes;
    this.lastStatusUpdate = application.lastStatusUpdate;
    this.interviewScheduledAt = application.interviewScheduledAt;
    this.interviewLocation = application.interviewLocation;
    this.interviewMeetingUrl = application.interviewMeetingUrl;
    this.interviewNotes = application.interviewNotes;
    this.interviewRating = application.interviewRating;
    this.employerFeedback = application.employerFeedback;
    this.candidateFeedback = application.candidateFeedback;
    this.ngoFeedback = application.ngoFeedback;
    this.accommodationRequests = application.accommodationRequests;
    this.needsAccessibilitySupport = application.needsAccessibilitySupport;
    this.needsTransportSupport = application.needsTransportSupport;
    this.needsInterpreterSupport = application.needsInterpreterSupport;
    this.reviewedAt = application.reviewedAt;
    this.shortlistedAt = application.shortlistedAt;
    this.interviewedAt = application.interviewedAt;
    this.finalDecisionAt = application.finalDecisionAt;
    this.withdrawnAt = application.withdrawnAt;
    this.offeredSalary = application.offeredSalary;
    this.contractTerms = application.contractTerms;
    this.proposedStartDate = application.proposedStartDate;
    this.isHired = application.isHired;
    this.hiredDate = application.hiredDate;
    this.communicationHistory = application.communicationHistory;
    this.emailsSent = application.emailsSent;
    this.callsMade = application.callsMade;
    this.daysToResponse = application.daysToResponse;
    this.daysToDecision = application.daysToDecision;
    this.consentToShare = application.consentToShare;
    this.consentToFollow = application.consentToFollow;
    this.createdAt = application.createdAt;
    this.updatedAt = application.updatedAt;

    if (includeRelations) {
      this.jobOffer = application.jobOffer;
      this.candidate = application.candidate;
      this.supportingNgo = application.supportingNgo;
    }
  }
}

export class PaginatedApplicationsResponseDto {
  @ApiProperty({ type: [ApplicationResponseDto] })
  data: ApplicationResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 10 })
  pages: number;

  @ApiProperty({ example: 1 })
  currentPage: number;
}

export class PagedApplicationsResponseDto {
  @ApiProperty({ type: [ApplicationResponseDto] })
  data: ApplicationResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
} 