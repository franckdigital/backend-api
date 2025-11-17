import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import { TokenBlacklistService } from './token-blacklist.service';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlacklistedToken]),
        CommonModule
    ],
    providers: [TokenBlacklistService],
    exports: [TokenBlacklistService]
})
export class TokenBlacklistModule { } 