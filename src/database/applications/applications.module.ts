import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from '../entities/application.entity';
import { CommonModule } from '../../common/common.module';
import { StorageModule } from '../../storage/storage.module';

/**
 * Module for managing job applications
 * Provides functionality for candidates and NGOs to apply to job offers
 * and for companies to manage applications
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Application]),
    CommonModule,
    StorageModule
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService]
})
export class ApplicationsModule {} 