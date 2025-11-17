import { PartialType } from '@nestjs/swagger';
import { CreateNgoDto } from './create-ngo.dto';

export class UpdateNgoDto extends PartialType(CreateNgoDto) {} 