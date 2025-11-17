import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('blacklisted_tokens')
export class BlacklistedToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    @Index('IDX_blacklisted_tokens_token_hash', { unique: true })
    tokenHash: string;

    @Column({ nullable: true })
    @Index('IDX_blacklisted_tokens_expires_at')
    expiresAt?: Date;

    @CreateDateColumn()
    createdAt: Date;
} 