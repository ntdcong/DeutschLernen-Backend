import { IsString, IsOptional } from 'class-validator';

export class AIRequestDto {
    @IsString()
    wordId: string;

    @IsOptional()
    @IsString()
    difficulty?: string; // A1, A2, B1, B2, C1
}
