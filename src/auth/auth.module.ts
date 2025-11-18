import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../database/users/users.module';
import { CommonModule } from '../common/common.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { TokenBlacklistModule } from '../database/token-blacklist/token-blacklist.module';
import { StorageModule } from '../storage/storage.module';
import { CandidatesModule } from '../database/candidates/candidates.module';
import { NgosModule } from '../database/ngos/ngos.module';
import { CompaniesModule } from '../database/companies/companies.module';
import { RolesModule } from '../database/roles/roles.module';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    PassportModule,
    CandidatesModule,
    NgosModule,
    CompaniesModule,
    RolesModule,
    StorageModule,
    TokenBlacklistModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => {
        const ttl = config.get<number>('auth.throttle.ttl') || 60;
        const limit = config.get<number>('auth.throttle.limit') || 10;
        
        return {
          throttlers: [{ ttl, limit }],
        };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret-key',
        signOptions: { 
          expiresIn: parseInt(configService.get<string>('jwt.expiresIn') || '3600', 10) // en secondes
        }
      })
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule { } 