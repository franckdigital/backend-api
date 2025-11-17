import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity representing business activity sectors
 * Used for categorizing companies and job offers
 */
@Entity('activity_sectors')
export class ActivitySector {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 150, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 