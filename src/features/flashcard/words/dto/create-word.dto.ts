import {
    IsString,
    IsBoolean,
    IsOptional,
    IsUUID,
    IsUrl,
    MinLength,
} from 'class-validator';

export class CreateWordDto {
    @IsUUID()
    deckId: string;

    @IsString()
    @MinLength(1, { message: 'Word must not be empty' })
    word: string;

    @IsString()
    @MinLength(1, { message: 'Meaning must not be empty' })
    meaning: string;

    @IsOptional()
    @IsString()
    genus?: string;

    @IsOptional()
    @IsString()
    plural?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Audio URL must be a valid URL' })
    audioUrl?: string;

    @IsOptional()
    @IsBoolean()
    isLearned?: boolean;
}
