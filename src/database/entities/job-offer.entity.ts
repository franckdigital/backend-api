import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { ActivitySector } from './activity-sector.entity';
import { ContractType } from './contract-type.entity';
import { EducationLevel } from './education-level.entity';
import { ExperienceLevel } from './experience-level.entity';
import { Location } from './location.entity';
import { DisabilityType } from './disability-type.entity';

/**
 * Entity representing job offers posted by companies
 * Specifically designed for disability-inclusive hiring
 */
@Entity('job_offers')
export class JobOffer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Company Information
    @Column()
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    // Job Basic Information
    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    responsibilities: string;

    @Column({ type: 'text', nullable: true })
    requirements: string;

    @Column({ type: 'text', nullable: true })
    benefits: string;

    // Job Classification
    @Column()
    activitySectorId: string;

    @ManyToOne(() => ActivitySector)
    @JoinColumn({ name: 'activitySectorId' })
    activitySector: ActivitySector;

    @Column()
    contractTypeId: string;

    @ManyToOne(() => ContractType)
    @JoinColumn({ name: 'contractTypeId' })
    contractType: ContractType;

    // Location
    @Column({ nullable: true })
    locationId: string | null;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'locationId' })
    location: Location | null;

    @Column({ type: 'text', nullable: true })
    specificAddress: string;

    @Column({ default: false })
    isRemoteWork: boolean;

    @Column({ default: false })
    isHybridWork: boolean;

    // Requirements
    @Column({ nullable: true })
    minimumEducationLevelId: string;

    @ManyToOne(() => EducationLevel)
    @JoinColumn({ name: 'minimumEducationLevelId' })
    minimumEducationLevel: EducationLevel;

    @Column({ nullable: true })
    minimumExperienceLevelId: string;

    @ManyToOne(() => ExperienceLevel)
    @JoinColumn({ name: 'minimumExperienceLevelId' })
    minimumExperienceLevel: ExperienceLevel;

    @Column({ type: 'text', nullable: true })
    requiredSkills: string; // JSON array of required skills

    @Column({ type: 'text', nullable: true })
    preferredSkills: string; // JSON array of preferred skills

    @Column({ type: 'text', nullable: true })
    languages: string; // JSON array of required languages

    // Salary Information
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salaryMin: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salaryMax: number;

    @Column({ length: 50, nullable: true })
    salaryCurrency: string;

    @Column({ 
        type: 'enum',
        enum: ['hourly', 'daily', 'monthly', 'yearly'],
        default: 'monthly'
    })
    salaryPeriod: string;

    @Column({ default: false })
    isSalaryNegotiable: boolean;

    // Disability-Specific Information
    @Column({ default: true })
    isDisabilityFriendly: boolean;

    @Column({ default: false })
    isExclusiveForDisabled: boolean; // Reserved for people with disabilities

    @ManyToMany(() => DisabilityType)
    @JoinTable({
        name: 'job_offer_disability_types',
        joinColumn: { name: 'job_offer_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'disability_type_id', referencedColumnName: 'id' }
    })
    suitableDisabilityTypes: DisabilityType[];

    @Column({ type: 'text', nullable: true })
    accessibilityAccommodations: string; // Workplace accommodations available

    @Column({ default: false })
    hasAccessibleWorkplace: boolean;

    @Column({ default: false })
    providesAssistiveTechnology: boolean;

    @Column({ default: false })
    offersFlexibleSchedule: boolean;

    // Job Details
    @Column({ type: 'int', default: 1 })
    numberOfPositions: number;

    @Column({ 
        type: 'enum',
        enum: ['full-time', 'part-time', 'contract', 'temporary'],
        default: 'full-time'
    })
    workingTime: string;

    @Column({ type: 'int', nullable: true })
    hoursPerWeek: number;

    // Application Details
    @Column({ type: 'date', nullable: true })
    applicationDeadline: Date;

    @Column({ type: 'date', nullable: true })
    startDate: Date;

    @Column({ length: 255, nullable: true })
    applicationEmail: string;

    @Column({ length: 50, nullable: true })
    applicationPhone: string;

    @Column({ length: 500, nullable: true })
    applicationUrl: string;

    @Column({ type: 'text', nullable: true })
    applicationInstructions: string;

    // Status and Visibility
    @Column({ 
        type: 'enum',
        enum: ['draft', 'published', 'paused', 'closed', 'expired'],
        default: 'draft'
    })
    status: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: true })
    isVisible: boolean;

    @Column({ type: 'date', nullable: true })
    publishedAt: Date;

    @Column({ type: 'date', nullable: true })
    closedAt: Date;

    // Statistics
    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @Column({ type: 'int', default: 0 })
    applicationCount: number;

    @Column({ type: 'int', default: 0 })
    shortlistedCount: number;

    @Column({ type: 'int', default: 0 })
    hiredCount: number;

    // SEO and Search
    @Column({ type: 'text', nullable: true })
    keywords: string; // For search optimization

    @Column({ type: 'text', nullable: true })
    searchableText: string; // Computed field for full-text search

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 