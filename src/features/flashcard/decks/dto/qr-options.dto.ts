import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

export enum QRType {
    SIMPLE = 'simple',
    CUSTOM = 'custom',
}

export class QROptionsDto {
    @IsOptional()
    @IsEnum(QRType)
    type?: QRType = QRType.SIMPLE;

    @IsOptional()
    @IsInt()
    @Min(100)
    @Max(1000)
    size?: number = 300;
}
