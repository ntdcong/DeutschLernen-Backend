import { IsString, IsOptional, IsIn } from 'class-validator';

export class SearchWordDto {
    @IsString()
    word: string;

    @IsOptional()
    @IsString()
    @IsIn(['vi', 'de'])
    source_lang?: string = 'de';
}
