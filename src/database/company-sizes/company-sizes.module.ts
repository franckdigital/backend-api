import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySize } from '../entities/company-size.entity';
import { CompanySizesService } from './company-sizes.service';
import { CompanySizesController } from './company-sizes.controller';
import { RolesModule } from '../roles/roles.module';

/**
 * Company Sizes Module
 * 
 * This module handles company size categories used for:
 * - Categorizing companies by employee count
 * - Tracking legal compliance requirements (e.g., disability quotas)
 * - Business logic related to company size-based regulations
 * 
 * Features:
 * - CRUD operations for company size categories
 * - Employee count-based company size lookup
 * - Disability quota compliance tracking
 * - Soft delete functionality
 * - Role-based access control for administrative operations
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([CompanySize]),
        RolesModule
    ],
    providers: [CompanySizesService],
    controllers: [CompanySizesController],
    exports: [CompanySizesService, TypeOrmModule],
})
export class CompanySizesModule { } 