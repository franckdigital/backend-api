import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
    ) { }

    async findAll(): Promise<Location[]> {
        return this.locationRepository.find({
            where: { isActive: true },
            relations: ['parent', 'children'],
            order: { type: 'ASC', name: 'ASC' },
        });
    }

    async findCountries(): Promise<Location[]> {
        return this.locationRepository.find({
            where: {
                isActive: true,
                type: 'country'
            },
            order: { name: 'ASC' },
        });
    }

    async findRegionsByCountry(countryId: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: {
                isActive: true,
                type: 'region',
                parentId: countryId
            },
            order: { name: 'ASC' },
        });
    }

    async findCitiesByRegion(regionId: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: {
                isActive: true,
                type: 'city',
                parentId: regionId
            },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Location> {
        const location = await this.locationRepository.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });

        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }

        return location;
    }

    async findByCode(code: string): Promise<Location> {
        const location = await this.locationRepository.findOne({
            where: { code },
            relations: ['parent', 'children'],
        });

        if (!location) {
            throw new NotFoundException(`Location with code ${code} not found`);
        }

        return location;
    }

    async getLocationHierarchy(id: string): Promise<Location[]> {
        const location = await this.findOne(id);
        const hierarchy: Location[] = [location];

        let current = location;
        while (current.parent) {
            current = await this.findOne(current.parentId);
            hierarchy.unshift(current);
        }

        return hierarchy;
    }

    async create(createData: Partial<Location>): Promise<Location> {
        const location = this.locationRepository.create(createData);
        return this.locationRepository.save(location);
    }

    async update(id: string, updateData: Partial<Location>): Promise<Location> {
        await this.findOne(id);
        await this.locationRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.locationRepository.update(id, { isActive: false });
    }
} 