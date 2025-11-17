import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { DisabilityType } from './disability-type.entity';
import { EducationLevel } from './education-level.entity';
import { ExperienceLevel } from './experience-level.entity';
import { Location } from './location.entity';
import { Profession } from './profession.entity';
import { Ngo } from './ngo.entity';

/**
 * Entity representing candidates (people with disabilities)
 * Extends user profile with disability-specific information
 */
@Entity('candidates')
export class Candidate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Disability Information
    @Column()
    disabilityTypeId: string;

    @ManyToOne(() => DisabilityType)
    @JoinColumn({ name: 'disabilityTypeId' })
    disabilityType: DisabilityType;

    @Column({ type: 'text', nullable: true })
    disabilityDescription: string;

    // NGO Association
    @Column({ nullable: true })
    ngoId: string;

    @ManyToOne(() => Ngo, ngo => ngo.candidates, { nullable: true })
    @JoinColumn({ name: 'ngoId' })
    ngo: Ngo;

    @Column({ default: false })
    isManagedByNgo: boolean;

    // Professional Information
    @Column({ nullable: true })
    educationLevelId: string;

    @ManyToOne(() => EducationLevel)
    @JoinColumn({ name: 'educationLevelId' })
    educationLevel: EducationLevel;

    @Column({ nullable: true })
    experienceLevelId: string;

    @ManyToOne(() => ExperienceLevel)
    @JoinColumn({ name: 'experienceLevelId' })
    experienceLevel: ExperienceLevel;

    @Column({ nullable: true })
    professionId: string;

    @ManyToOne(() => Profession)
    @JoinColumn({ name: 'professionId' })
    profession: Profession;

    @Column({ type: 'text', nullable: true })
    professionalSummary: string;

    @Column({ type: 'text', nullable: true })
    skills: string; // JSON array of skills

    @Column({ type: 'text', nullable: true })
    languages: string; // JSON array of languages with levels

    // Location
    @Column({ nullable: true })
    locationId: string | null;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'locationId' })
    location: Location | null;

    // Media Files
    @Column({ length: 255, nullable: true })
    cvFileUrl: string;

    @Column({ length: 255, nullable: true })
    photoUrl: string;

    @Column({ length: 255, nullable: true })
    videoPresentation: string;

    @Column({ type: 'text', nullable: true })
    biography: string;

    // Job Preferences
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    expectedSalaryMin: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    expectedSalaryMax: number;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ type: 'date', nullable: true })
    availabilityDate: Date;

    // Profile Completion
    @Column({ type: 'int', default: 0 })
    profileCompletionPercentage: number;

    @Column({ default: false })
    isProfileComplete: boolean;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 