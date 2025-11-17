import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity representing company sizes
 * Used for categorizing companies and legal compliance tracking
 */
@Entity('company_sizes')
export class CompanySize {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int' })
    minEmployees: number;

    @Column({ type: 'int', nullable: true })
    maxEmployees: number; // null for unlimited

    @Column({ default: false })
    requiresDisabilityQuota: boolean; // True for companies with 100+ employees

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    disabilityQuotaPercentage: number; // e.g., 2.00 for 2%

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 