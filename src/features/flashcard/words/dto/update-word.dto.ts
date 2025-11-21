import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateWordDto } from './create-word.dto';

// Omit deckId because it cannot be changed after creation
export class UpdateWordDto extends PartialType(
    OmitType(CreateWordDto, ['deckId'] as const),
) { }
