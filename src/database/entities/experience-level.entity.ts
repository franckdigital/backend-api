import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity representing experience levels
 * Used for candidate profiles and job requirements
 */
@Entity('experience_levels')
export class ExperienceLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int' })
    minYears: number; // Minimum years of experience

    @Column({ type: 'int', nullable: true })
    maxYears: number; // Maximum years of experience (null for unlimited)

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 