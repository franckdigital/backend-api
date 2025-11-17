import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class TokenBlacklistService {
    constructor(
        @InjectRepository(BlacklistedToken)
        private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
    ) {}

    /**
     * Creates a hash of the token
     * @param token The token to hash
     * @returns The hashed token
     */
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Adds a token to the blacklist
     * @param token The token to blacklist
     * @param expiresAt Optional expiration date. If not provided, the token will be blacklisted forever.
     */
    async blacklistToken(token: string, expiresAt?: Date): Promise<void> {
        const tokenHash = this.hashToken(token);
        const blacklistedToken = this.blacklistedTokenRepository.create({
            tokenHash,
            expiresAt,
        });
        
        await this.blacklistedTokenRepository.save(blacklistedToken);
    }

    /**
     * Checks if a token is blacklisted
     * @param token The token to check
     * @returns True if the token is blacklisted, false otherwise
     */
    async isBlacklisted(token: string): Promise<boolean> {
        const tokenHash = this.hashToken(token);
        const count = await this.blacklistedTokenRepository.count({
            where: {
                tokenHash,
            },
        });
        
        return count > 0;
    }

    /**
     * Cleans up expired tokens from the blacklist
     * @returns The number of tokens removed
     */
    async cleanupExpiredTokens(): Promise<number> {
        const now = new Date();
        
        const result = await this.blacklistedTokenRepository.delete({
            expiresAt: LessThan(now),
        });
        
        return result.affected || 0;
    }
} 