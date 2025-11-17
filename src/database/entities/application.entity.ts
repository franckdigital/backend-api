import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JobOffer } from './job-offer.entity';
import { Candidate } from './candidate.entity';
import { Ngo } from './ngo.entity';

/**
 * Entity representing job applications submitted by candidates
 * Tracks the application process and status
 */
@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Related Entities
    @Column()
    jobOfferId: string;

    @ManyToOne(() => JobOffer)
    @JoinColumn({ name: 'jobOfferId' })
    jobOffer: JobOffer;

    @Column()
    candidateId: string;

    @ManyToOne(() => Candidate)
    @JoinColumn({ name: 'candidateId' })
    candidate: Candidate;

    @Column({ nullable: true })
    supportingNgoId: string;

    @ManyToOne(() => Ngo, { nullable: true })
    @JoinColumn({ name: 'supportingNgoId' })
    supportingNgo: Ngo;

    // Application Content
    @Column({ type: 'text', nullable: true })
    coverLetter: string;

    @Column({ type: 'text', nullable: true })
    motivationLetter: string;

    @Column({ type: 'text', nullable: true })
    additionalNotes: string;

    // Documents
    @Column({ length: 255, nullable: true })
    cvFileUrl: string;

    @Column({ length: 255, nullable: true })
    portfolioUrl: string;

    @Column({ type: 'text', nullable: true })
    attachmentUrls: string; // JSON array of additional document URLs

    // Application Status
    @Column({ 
        type: 'enum',
        enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'withdrawn'],
        default: 'submitted'
    })
    status: string;

    @Column({ type: 'text', nullable: true })
    statusNotes: string;

    @Column({ type: 'date', nullable: true })
    lastStatusUpdate: Date;

    // Interview Information
    @Column({ type: 'datetime', nullable: true })
    interviewScheduledAt: Date;

    @Column({ length: 255, nullable: true })
    interviewLocation: string;

    @Column({ length: 500, nullable: true })
    interviewMeetingUrl: string;

    @Column({ type: 'text', nullable: true })
    interviewNotes: string;

    @Column({ type: 'int', nullable: true })
    interviewRating: number; // 1-5 rating

    // Feedback
    @Column({ type: 'text', nullable: true })
    employerFeedback: string;

    @Column({ type: 'text', nullable: true })
    candidateFeedback: string;

    @Column({ type: 'text', nullable: true })
    ngoFeedback: string;

    // Accommodation Requests
    @Column({ type: 'text', nullable: true })
    accommodationRequests: string;

    @Column({ default: false })
    needsAccessibilitySupport: boolean;

    @Column({ default: false })
    needsTransportSupport: boolean;

    @Column({ default: false })
    needsInterpreterSupport: boolean;

    // Timeline Tracking
    @Column({ type: 'datetime', nullable: true })
    reviewedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    shortlistedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    interviewedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    finalDecisionAt: Date;

    @Column({ type: 'datetime', nullable: true })
    withdrawnAt: Date;

    // Salary and Terms (if selected)
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    offeredSalary: number;

    @Column({ type: 'text', nullable: true })
    contractTerms: string;

    @Column({ type: 'date', nullable: true })
    proposedStartDate: Date;

    @Column({ default: false })
    isHired: boolean;

    @Column({ type: 'date', nullable: true })
    hiredDate: Date;

    // Communication History
    @Column({ type: 'text', nullable: true })
    communicationHistory: string; // JSON array of communication records

    @Column({ type: 'int', default: 0 })
    emailsSent: number;

    @Column({ type: 'int', default: 0 })
    callsMade: number;

    // Metrics
    @Column({ type: 'int', nullable: true })
    daysToResponse: number; // Days from application to first response

    @Column({ type: 'int', nullable: true })
    daysToDecision: number; // Days from application to final decision

    // Privacy and Consent
    @Column({ default: true })
    consentToShare: boolean; // Consent to share info with NGO

    @Column({ default: true })
    consentToFollow: boolean; // Consent for follow-up communications

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 