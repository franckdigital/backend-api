import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Entity for system notifications
 * Manages all types of notifications sent to users
 */
@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Recipient
    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    // Notification Content
    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ 
        type: 'enum',
        enum: ['info', 'success', 'warning', 'error', 'reminder'],
        default: 'info'
    })
    type: string;

    @Column({ 
        type: 'enum',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    })
    priority: string;

    // Categorization
    @Column({ 
        type: 'enum',
        enum: ['application', 'job_offer', 'profile', 'compliance', 'system', 'reminder', 'security'],
        default: 'system'
    })
    category: string;

    // Related Entity (optional)
    @Column({ length: 255, nullable: true })
    relatedEntityType: string; // 'application', 'job_offer', 'company', etc.

    @Column({ nullable: true })
    relatedEntityId: string;

    @Column({ length: 500, nullable: true })
    actionUrl: string; // URL to take action related to notification

    @Column({ length: 255, nullable: true })
    actionLabel: string; // Label for the action button

    // Read Status
    @Column({ default: false })
    isRead: boolean;

    @Column({ type: 'datetime', nullable: true })
    readAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 