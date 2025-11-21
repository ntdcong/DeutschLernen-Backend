import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateDeckDto {
    @IsString()
    @MinLength(1, { message: 'Deck name must not be empty' })
    name: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
