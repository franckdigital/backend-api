import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, UsePipes, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { Location } from '../entities/location.entity';
import { CreateLocationDto, UpdateLocationDto, LocationResponseDto, SimpleLocationResponseDto } from './locations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Get()
    @ApiOperation({ 
        summary: 'Get all active locations',
        description: 'Retrieve a list of all active locations with their hierarchical structure (parent and children)'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of locations',
        type: [LocationResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findAll(): Promise<Location[]> {
        return this.locationsService.findAll();
    }

    @Get('countries')
    @ApiOperation({ 
        summary: 'Get all countries',
        description: 'Retrieve a list of all active countries (top-level locations in the hierarchy)'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of countries',
        type: [SimpleLocationResponseDto]
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    async findCountries(): Promise<Location[]> {
        return this.locationsService.findCountries();
    }

    @Get('countries/:countryId/regions')
    @ApiOperation({ 
        summary: 'Get regions by country',
        description: 'Retrieve all regions belonging to a specific country'
    })
    @ApiParam({
        name: 'countryId',
        description: 'Unique identifier of the country',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of regions',
        type: [SimpleLocationResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Country not found' 
    })
    async findRegionsByCountry(@Param('countryId', ParseUUIDPipe) countryId: string): Promise<Location[]> {
        return this.locationsService.findRegionsByCountry(countryId);
    }

    @Get('regions/:regionId/cities')
    @ApiOperation({ 
        summary: 'Get cities by region',
        description: 'Retrieve all cities belonging to a specific region'
    })
    @ApiParam({
        name: 'regionId',
        description: 'Unique identifier of the region',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of cities',
        type: [SimpleLocationResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Region not found' 
    })
    async findCitiesByRegion(@Param('regionId', ParseUUIDPipe) regionId: string): Promise<Location[]> {
        return this.locationsService.findCitiesByRegion(regionId);
    }

    @Get(':id/hierarchy')
    @ApiOperation({ 
        summary: 'Get location hierarchy',
        description: 'Get the complete hierarchical path from country to the specified location (e.g., Senegal > Dakar Region > Dakar)'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the location',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved location hierarchy',
        type: [LocationResponseDto]
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Location not found' 
    })
    async getLocationHierarchy(@Param('id', ParseUUIDPipe) id: string): Promise<Location[]> {
        return this.locationsService.getLocationHierarchy(id);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get location by ID',
        description: 'Retrieve a specific location by its unique identifier with parent and children relationships'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the location',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved location',
        type: LocationResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Location not found' 
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Location> {
        return this.locationsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Create new location',
        description: 'Create a new location in the hierarchy. Requires admin or super-admin role. Ensure proper parent-child relationships.'
    })
    @ApiBody({
        type: CreateLocationDto,
        description: 'Location data'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Successfully created location',
        type: LocationResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Validation failed or invalid parent relationship' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin or super-admin role required' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Location with same name or code already exists' 
    })
    async create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
        return this.locationsService.create(createLocationDto);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Update location',
        description: 'Update an existing location. Requires admin or super-admin role. Be careful when changing parent relationships to avoid circular references.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the location to update',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        type: UpdateLocationDto,
        description: 'Location update data'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully updated location',
        type: LocationResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format, validation failed, or circular reference detected' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin or super-admin role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Location not found' 
    })
    @ApiResponse({ 
        status: 409, 
        description: 'Conflict - Location with same name or code already exists' 
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateLocationDto: UpdateLocationDto
    ): Promise<Location> {
        return this.locationsService.update(id, updateLocationDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super-admin')
    @ApiOperation({ 
        summary: 'Delete location',
        description: 'Soft delete a location by setting isActive to false. Requires admin or super-admin role. Note: This will also affect child locations and related entities.'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the location to delete',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully deleted location' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid UUID format or location has active children' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Valid JWT token required' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Admin or super-admin role required' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Location not found' 
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.locationsService.remove(id);
    }
} 