import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

/**
 * Entity for tracking legal compliance of companies
 * Monitors the 2% disability quota requirement for companies with 100+ employees
 */
@Entity('legal_compliance')
export class LegalCompliance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Company Reference
    @Column()
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    // Reporting Period
    @Column({ type: 'date' })
    reportingPeriodStart: Date;

    @Column({ type: 'date' })
    reportingPeriodEnd: Date;

    @Column({ type: 'int' })
    reportingYear: number;

    // Employee Count Data
    @Column({ type: 'int' })
    totalEmployeeCount: number;

    @Column({ type: 'int', default: 0 })
    disabledEmployeesCount: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    requiredQuotaPercentage: number; // Usually 2.00%

    @Column({ type: 'int' })
    requiredDisabledEmployeesCount: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    actualQuotaPercentage: number;

    // Compliance Status
    @Column({ default: false })
    isCompliant: boolean;

    @Column({ type: 'int', default: 0 })
    shortfallCount: number; // How many disabled employees short

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    fineAmount: number; // Potential fine amount

    @Column({ 
        type: 'enum',
        enum: ['compliant', 'non_compliant', 'partial_compliant', 'under_review', 'exempt'],
        default: 'under_review'
    })
    complianceStatus: string;

    // Actions Taken
    @Column({ type: 'int', default: 0 })
    newHiresDisabled: number; // New disabled employees hired in period

    @Column({ type: 'int', default: 0 })
    jobOffersPosted: number; // Job offers posted during period

    @Column({ type: 'int', default: 0 })
    disabilityFriendlyJobOffers: number;

    @Column({ type: 'int', default: 0 })
    applicationsReceived: number;

    @Column({ type: 'int', default: 0 })
    candidatesInterviewed: number;

    // Alternative Compliance Measures
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    contractsWithNgos: number; // Value of contracts with NGOs

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    accessibilityInvestments: number; // Investments in accessibility

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    trainingProgramsInvestment: number; // Training for disabled employees

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalCompensatoryContributions: number;

    // Legal Documentation
    @Column({ length: 255, nullable: true })
    reportDocumentUrl: string;

    @Column({ type: 'text', nullable: true })
    evidenceDocuments: string; // JSON array of document URLs

    @Column({ type: 'text', nullable: true })
    justificationText: string;

    @Column({ type: 'text', nullable: true })
    improvementPlan: string;

    // Submission and Review
    @Column({ type: 'date', nullable: true })
    submittedAt: Date;

    @Column({ type: 'date', nullable: true })
    reviewedAt: Date;

    @Column({ length: 255, nullable: true })
    reviewedBy: string; // Ministry officer ID

    @Column({ type: 'text', nullable: true })
    reviewNotes: string;

    @Column({ default: false })
    isApproved: boolean;

    @Column({ type: 'date', nullable: true })
    approvalDate: Date;

    // Notifications and Deadlines
    @Column({ type: 'date', nullable: true })
    nextReportingDeadline: Date;

    @Column({ default: false })
    reminderSent: boolean;

    @Column({ default: false })
    warningIssued: boolean;

    @Column({ type: 'date', nullable: true })
    warningIssuedAt: Date;

    // Penalties
    @Column({ default: false })
    penaltyApplied: boolean;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    penaltyAmount: number;

    @Column({ type: 'date', nullable: true })
    penaltyDueDate: Date;

    @Column({ default: false })
    penaltyPaid: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 