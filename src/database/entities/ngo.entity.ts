import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { ActivitySector } from './activity-sector.entity';
import { Location } from './location.entity';
import { DisabilityType } from './disability-type.entity';
import { Candidate } from './candidate.entity';

/**
 * Entity representing NGOs (Non-Governmental Organizations)
 * NGOs can support candidates and track job applications
 */
@Entity('ngos')
export class Ngo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Candidates managed by this NGO
    @OneToMany(() => Candidate, candidate => candidate.ngo)
    candidates: Candidate[];

    // NGO Information
    @Column({ length: 255 })
    organizationName: string;

    @Column({ length: 255, unique: true, nullable: true })
    registrationNumber: string;

    @Column({ length: 255, nullable: true })
    taxNumber: string;

    @Column({ type: 'text', nullable: true })
    mission: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 500, nullable: true })
    website: string;

    @Column({ length: 255, nullable: true })
    logoUrl: string;

    @Column({ type: 'date', nullable: true })
    foundedDate: Date;

    // Activity Focus
    @ManyToMany(() => ActivitySector)
    @JoinTable({
        name: 'ngo_activity_sectors',
        joinColumn: { name: 'ngo_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'activity_sector_id', referencedColumnName: 'id' }
    })
    focusAreas: ActivitySector[];

    // Disability Types Supported
    @ManyToMany(() => DisabilityType)
    @JoinTable({
        name: 'ngo_disability_types',
        joinColumn: { name: 'ngo_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'disability_type_id', referencedColumnName: 'id' }
    })
    supportedDisabilityTypes: DisabilityType[];

    // Location
    @Column({ nullable: true })
    locationId: string | null;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'locationId' })
    location: Location | null;

    @Column({ type: 'text', nullable: true })
    fullAddress: string;

    // Service Areas (additional locations where NGO operates)
    @ManyToMany(() => Location)
    @JoinTable({
        name: 'ngo_service_areas',
        joinColumn: { name: 'ngo_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'location_id', referencedColumnName: 'id' }
    })
    serviceAreas: Location[];

    // Contact Information
    @Column({ length: 255, nullable: true })
    primaryContactName: string;

    @Column({ length: 255, nullable: true })
    primaryContactEmail: string;

    @Column({ length: 50, nullable: true })
    primaryContactPhone: string;

    @Column({ length: 255, nullable: true })
    secondaryContactName: string;

    @Column({ length: 255, nullable: true })
    secondaryContactEmail: string;

    @Column({ length: 50, nullable: true })
    secondaryContactPhone: string;

    // Capacity & Statistics
    @Column({ type: 'int', default: 0 })
    totalCandidatesSupported: number;

    @Column({ type: 'int', default: 0 })
    successfulPlacements: number;

    @Column({ type: 'int', default: 0 })
    activeMembers: number;

    @Column({ type: 'int', default: 0 })
    staffCount: number;

    // Services Offered
    @Column({ type: 'text', nullable: true })
    servicesOffered: string; // JSON array of services

    @Column({ default: false })
    providesJobTraining: boolean;

    @Column({ default: false })
    providesCareerCounseling: boolean;

    @Column({ default: false })
    providesLegalSupport: boolean;

    @Column({ default: false })
    providesHealthcareSupport: boolean;

    // Verification & Status
    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'date', nullable: true })
    verificationDate: Date;

    @Column({ type: 'text', nullable: true })
    verificationNotes: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: true })
    canSupportCandidates: boolean;

    // Profile Completion
    @Column({ type: 'int', default: 0 })
    profileCompletionPercentage: number;

    @Column({ default: false })
    isProfileComplete: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 