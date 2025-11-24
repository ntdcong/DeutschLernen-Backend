import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';
import { Sentence } from '../../../entities/sentence.entity';
import { Word } from '../../../entities/word.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Sentence, Word])],
    controllers: [SentencesController],
    providers: [SentencesService],
    exports: [SentencesService],
})
export class SentencesModule { }
