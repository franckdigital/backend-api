import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    @Index('IDX_token_blacklist_token_hash')
    tokenHash: string;

    @Column({
        type: 'enum',
        enum: ['refresh', 'access', 'magic-link', 'reset-password'],
    })
    tokenType: string;

    @Column({ length: 255, nullable: true })
    @Index('IDX_token_blacklist_user_id')
    userId: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true, length: 255 })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 