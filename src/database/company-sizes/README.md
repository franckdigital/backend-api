# Company Sizes Module

## Overview

The Company Sizes module manages company size categories used for categorizing companies by employee count and tracking legal compliance requirements, particularly disability quotas mandated by law.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete company size categories
- ✅ **Pagination**: Retrieve company sizes with pagination support
- ✅ **Search Functionality**: Filter company sizes by name or description
- ✅ **Employee Count Lookup**: Find appropriate company size based on employee count
- ✅ **Disability Quota Tracking**: Manage compliance requirements for companies with 100+ employees
- ✅ **Soft Delete**: Maintains data integrity by deactivating instead of hard deletion
- ✅ **Role-based Access Control**: Admin and super-admin roles for administrative operations
- ✅ **Swagger Documentation**: Complete API documentation with examples
- ✅ **Input Validation**: Comprehensive validation using class-validator

## API Endpoints

### Public Endpoints (Requires Authentication)

#### `GET /company-sizes?page=&size=&search=`
Retrieve company sizes with pagination and optional search functionality.

**Query Parameters:**
- `page` (number, optional, default: 1): Page number (1-based)
- `size` (number, optional, default: 10, max: 100): Number of items per page
- `search` (string, optional): Search term to filter by name or description

**Response Example:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Small Enterprise",
      "description": "Companies with 10 to 49 employees",
      "minEmployees": 10,
      "maxEmployees": 49,
      "requiresDisabilityQuota": false,
      "disabilityQuotaPercentage": null,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "pageSize": 10,
    "totalItems": 25,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Usage Examples:**
- `GET /company-sizes` - First page with default size (10)
- `GET /company-sizes?page=2&size=5` - Second page with 5 items
- `GET /company-sizes?search=enterprise` - Search for "enterprise"
- `GET /company-sizes?page=1&size=20&search=small` - First page, 20 items, search "small"

#### `GET /company-sizes/all`
Retrieve all active company sizes ordered by minimum employees.

**Response Example:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Small Enterprise",
    "description": "Companies with 10 to 49 employees",
    "minEmployees": 10,
    "maxEmployees": 49,
    "requiresDisabilityQuota": false,
    "disabilityQuotaPercentage": null,
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### `GET /company-sizes/by-employee-count?count={number}`
Find company size category based on employee count.

**Query Parameters:**
- `count` (number, required): Number of employees

**Response Example:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Small Enterprise",
  "description": "Companies with 10 to 49 employees",
  "minEmployees": 10,
  "maxEmployees": 49,
  "requiresDisabilityQuota": false,
  "disabilityQuotaPercentage": null,
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### `GET /company-sizes/:id`
Retrieve a specific company size by ID.

### Admin Endpoints (Requires Admin/Super-Admin Role)

#### `POST /company-sizes`
Create a new company size category.

**Request Body Example:**
```json
{
  "name": "Large Enterprise",
  "description": "Companies with 100 or more employees",
  "minEmployees": 100,
  "maxEmployees": null,
  "requiresDisabilityQuota": true,
  "disabilityQuotaPercentage": 2.00,
  "isActive": true,
  "sortOrder": 3
}
```

#### `PATCH /company-sizes/:id`
Update an existing company size category.

**Request Body Example:**
```json
{
  "name": "Medium Enterprise",
  "requiresDisabilityQuota": true,
  "disabilityQuotaPercentage": 3.00
}
```

#### `DELETE /company-sizes/:id`
Soft delete a company size (sets `isActive` to `false`).

## DTOs

### PaginatedCompanySizeQueryDto
Used for paginated requests with search.

**Fields:**
- `page` (number, optional, min: 1, default: 1): Page number
- `size` (number, optional, min: 1, max: 100, default: 10): Items per page
- `search` (string, optional, max: 255): Search term

### PaginatedCompanySizeResponseDto
Response format for paginated data.

**Fields:**
- `data` (CompanySizeResponseDto[]): Array of company sizes
- `meta` (PaginationMetaDto): Pagination metadata

### PaginationMetaDto
Pagination metadata included in paginated responses.

**Fields:**
- `currentPage` (number): Current page number
- `totalPages` (number): Total number of pages
- `pageSize` (number): Number of items per page
- `totalItems` (number): Total number of items
- `hasNext` (boolean): Whether there is a next page
- `hasPrevious` (boolean): Whether there is a previous page

### CreateCompanySizeDto
Used for creating new company size categories.

**Required Fields:**
- `name` (string, max 100 chars): Name of the company size category
- `minEmployees` (number, min 0): Minimum number of employees

**Optional Fields:**
- `description` (string): Description of the category
- `maxEmployees` (number, min 1): Maximum employees (null for unlimited)
- `requiresDisabilityQuota` (boolean): Whether disability quota is required
- `disabilityQuotaPercentage` (number, 0-100): Quota percentage if required
- `isActive` (boolean, default: true): Whether the category is active
- `sortOrder` (number, min 0, default: 0): Display order

### UpdateCompanySizeDto
Extends `CreateCompanySizeDto` with all fields optional for partial updates.

### CompanySizeQueryDto
Used for employee count queries.

**Required Fields:**
- `count` (number, min 0): Number of employees

### CompanySizeResponseDto
Response format for all company size data.

## Business Logic

### Pagination and Search
- **Pagination**: Uses offset-based pagination with configurable page size
- **Search**: Case-insensitive search across name and description fields
- **Ordering**: Results are ordered by `minEmployees` ASC, then `sortOrder` ASC
- **Performance**: Search uses database LIKE queries with proper indexing

### Disability Quota Compliance
Companies in France with 100 or more employees are required to meet disability employment quotas:
- **Standard Quota**: 2% of workforce must be employees with disabilities
- **Tracking**: The system tracks which company sizes require compliance
- **Flexibility**: Quota percentages can be customized per category

### Employee Count Matching
The system uses SQL queries to find the appropriate company size:
```sql
WHERE minEmployees <= :count 
AND (maxEmployees IS NULL OR maxEmployees >= :count)
AND isActive = true
```

## Example Company Size Categories

| Name | Min Employees | Max Employees | Disability Quota | Quota % |
|------|---------------|---------------|------------------|---------|
| Micro Enterprise | 1 | 9 | No | - |
| Small Enterprise | 10 | 49 | No | - |
| Medium Enterprise | 50 | 99 | No | - |
| Large Enterprise | 100 | null | Yes | 2.00% |

## Authentication & Authorization

- **All endpoints** require JWT authentication
- **Admin operations** (POST, PATCH, DELETE) require `admin` or `super-admin` role
- **Public operations** (GET) require valid authentication only

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "page must not be less than 1",
    "size must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Company size with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

## Usage Examples

### Using the Service
```typescript
import { CompanySizesService } from './company-sizes.service';

@Injectable()
export class MyService {
  constructor(private companySizesService: CompanySizesService) {}

  async getCompanySizesPaginated(page: number, size: number, search?: string) {
    return this.companySizesService.findAllPaginated({ page, size, search });
  }

  async getCompanySizeForEmployees(count: number) {
    return this.companySizesService.findByEmployeeCount(count);
  }
}
```

### Using DTOs
```typescript
import { PaginatedCompanySizeQueryDto, CreateCompanySizeDto } from './company-sizes.dto';

// Pagination query
const query: PaginatedCompanySizeQueryDto = {
  page: 1,
  size: 10,
  search: 'enterprise'
};

// Create new company size
const newCompanySize: CreateCompanySizeDto = {
  name: 'Startup',
  description: 'Early stage companies',
  minEmployees: 1,
  maxEmployees: 10,
  requiresDisabilityQuota: false,
  isActive: true,
  sortOrder: 0
};
```

### Frontend Integration
```javascript
// Fetch paginated company sizes
const fetchCompanySizes = async (page = 1, size = 10, search = '') => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (size) params.append('size', size.toString());
  if (search) params.append('search', search);
  
  const response = await fetch(`/api/company-sizes?${params}`);
  return response.json();
};

// Example usage
const { data, meta } = await fetchCompanySizes(2, 15, 'enterprise');
console.log(`Page ${meta.currentPage} of ${meta.totalPages}`);
console.log(`Showing ${data.length} of ${meta.totalItems} items`);
```

## Database Schema

The module uses the `CompanySize` entity with the following fields:

```typescript
@Entity('company_sizes')
export class CompanySize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  minEmployees: number;

  @Column({ type: 'int', nullable: true })
  maxEmployees: number;

  @Column({ default: false })
  requiresDisabilityQuota: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  disabilityQuotaPercentage: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
``` 