import { IsUUID, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class GenerateWordsDto {
    @IsUUID()
    deckId: string;

    @IsString()
    topic: string;

    @IsInt()
    @Min(1)
    @Max(50)
    count: number;

    @IsOptional()
    @IsString()
    level?: string; // A1, A2, B1, B2, C1, C2
}
