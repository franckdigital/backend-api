import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Entity for managing uploaded documents and files
 * Supports various document types for candidates, companies, and NGOs
 */
@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Owner
    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    // Document Information
    @Column({ length: 255 })
    originalName: string;

    @Column({ length: 255 })
    fileName: string; // Stored file name

    @Column({ length: 500 })
    fileUrl: string;

    @Column({ length: 100 })
    mimeType: string;

    @Column({ type: 'bigint' })
    fileSize: number; // in bytes

    @Column({ 
        type: 'enum',
        enum: ['cv', 'cover_letter', 'certificate', 'diploma', 'id_document', 'medical_certificate', 'portfolio', 'company_registration', 'tax_document', 'photo', 'video', 'other'],
        default: 'other'
    })
    documentType: string;

    // Categorization
    @Column({ 
        type: 'enum',
        enum: ['candidate', 'company', 'ngo', 'application', 'compliance', 'system'],
        default: 'candidate'
    })
    category: string;

    // Related Entity (optional)
    @Column({ length: 255, nullable: true })
    relatedEntityType: string; // 'application', 'candidate_profile', etc.

    @Column({ nullable: true })
    relatedEntityId: string;

    // Verification Status
    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'datetime', nullable: true })
    verifiedAt: Date;

    @Column({ length: 255, nullable: true })
    verifiedBy: string;

    @Column({ type: 'text', nullable: true })
    verificationNotes: string;

    // Access Control
    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isPublic: boolean;

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date;

    // Metadata
    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    tags: string; // JSON array of tags

    @Column({ type: 'text', nullable: true })
    metadata: string; // JSON for additional data

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 