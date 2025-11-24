import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSentenceDto {
    @IsString()
    wordId: string;

    @IsString()
    german: string;

    @IsString()
    vietnamese: string;

    @IsOptional()
    @IsString()
    grammarNote?: string;

    @IsOptional()
    @IsString()
    difficulty?: string; // A1, A2, B1, B2, C1

    @IsOptional()
    @IsBoolean()
    isFavorite?: boolean;

    @IsOptional()
    @IsString()
    source?: string; // 'ai-generated' | 'user-created'
}
