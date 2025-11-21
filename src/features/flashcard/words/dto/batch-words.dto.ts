import { IsArray, IsUUID } from 'class-validator';

export class BatchWordsDto {
    @IsArray()
    @IsUUID('4', { each: true })
    ids: string[];
}
