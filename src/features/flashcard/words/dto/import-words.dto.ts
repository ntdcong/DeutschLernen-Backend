import { IsUUID } from 'class-validator';

export class ImportWordsDto {
    @IsUUID()
    deckId: string;
}
