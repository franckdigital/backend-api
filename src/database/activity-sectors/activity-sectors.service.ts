import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { ActivitySector } from '../entities/activity-sector.entity';
import { ActivitySectorPageQueryDto } from './activity-sectors.dto';

@Injectable()
export class ActivitySectorsService {
  constructor(
    @InjectRepository(ActivitySector)
    private readonly activitySectorRepository: Repository<ActivitySector>,
  ) {}

  async findAll(): Promise<ActivitySector[]> {
    return this.activitySectorRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Find activity sectors with pagination and search
   */
  async findWithPagination(queryOptions: ActivitySectorPageQueryDto) {
    const { page = 1, size = 10, search, isActive = true } = queryOptions;
    
    const queryBuilder = this.activitySectorRepository.createQueryBuilder('activitySector');
    
    // Apply active filter
    queryBuilder.where('activitySector.isActive = :isActive', { isActive });
    
    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(activitySector.name) LIKE LOWER(:search) OR LOWER(activitySector.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }
    
    // Apply sorting
    queryBuilder.orderBy('activitySector.sortOrder', 'ASC')
                .addOrderBy('activitySector.name', 'ASC');
    
    // Apply pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    
    return {
      data,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size)
      }
    };
  }

  async findOne(id: string): Promise<ActivitySector> {
    const activitySector = await this.activitySectorRepository.findOne({
      where: { id },
    });

    if (!activitySector) {
      throw new NotFoundException(`Activity sector with ID ${id} not found`);
    }

    return activitySector;
  }

  async create(createData: Partial<ActivitySector>): Promise<ActivitySector> {
    const activitySector = this.activitySectorRepository.create(createData);
    return this.activitySectorRepository.save(activitySector);
  }

  async update(id: string, updateData: Partial<ActivitySector>): Promise<ActivitySector> {
    await this.findOne(id);
    await this.activitySectorRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.activitySectorRepository.update(id, { isActive: false });
  }
} 