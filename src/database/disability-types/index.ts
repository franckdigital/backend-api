// Export entity
export { DisabilityType } from '../entities/disability-type.entity';

// Export DTOs
export {
    CreateDisabilityTypeDto,
    UpdateDisabilityTypeDto,
    DisabilityTypeResponseDto,
    DisabilityTypePageQueryDto,
    PagedDisabilityTypesResponseDto
} from './disability-types.dto';

// Export service
export { DisabilityTypesService } from './disability-types.service';

// Export controller
export { DisabilityTypesController } from './disability-types.controller';

// Export module
export { DisabilityTypesModule } from './disability-types.module'; 