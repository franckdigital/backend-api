import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { ActivitySector } from './activity-sector.entity';
import { CompanySize } from './company-size.entity';
import { Location } from './location.entity';

/**
 * Entity representing companies
 * Companies can post job offers and manage applications
 */
@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Company Information
    @Column({ length: 255 })
    companyName: string;

    @Column({ length: 255, unique: true, nullable: true })
    registrationNumber: string; // RCCM, SIRET, etc.

    @Column({ length: 255, nullable: true })
    taxNumber: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 500, nullable: true })
    website: string;

    @Column({ length: 255, nullable: true })
    logoUrl: string;

    // Activity Sector
    @Column()
    activitySectorId: string;

    @ManyToOne(() => ActivitySector)
    @JoinColumn({ name: 'activitySectorId' })
    activitySector: ActivitySector;

    // Company Size
    @Column()
    companySizeId: string;

    @ManyToOne(() => CompanySize)
    @JoinColumn({ name: 'companySizeId' })
    companySize: CompanySize;

    @Column({ type: 'int', nullable: true })
    exactEmployeeCount: number;

    // Location
    @Column({ nullable: true })
    locationId: string | null;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'locationId' })
    location: Location | null;

    @Column({ type: 'text', nullable: true })
    fullAddress: string;

    // Legal Compliance
    @Column({ default: false })
    isSubjectToDisabilityQuota: boolean;

    @Column({ type: 'int', default: 0 })
    currentDisabledEmployeesCount: number;

    @Column({ type: 'int', default: 0 })
    requiredDisabledEmployeesCount: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    currentCompliancePercentage: number;

    @Column({ default: false })
    isCompliantWithLaw: boolean;

    @Column({ type: 'date', nullable: true })
    lastComplianceCheckDate: Date;

    // Contact Information
    @Column({ length: 255, nullable: true })
    hrContactName: string;

    @Column({ length: 255, nullable: true })
    hrContactEmail: string;

    @Column({ length: 50, nullable: true })
    hrContactPhone: string;

    // Company Status
    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'date', nullable: true })
    verificationDate: Date;

    @Column({ type: 'text', nullable: true })
    verificationNotes: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: true })
    canPostJobOffers: boolean;

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