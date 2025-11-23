import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { GroqService } from './groq.service';
import { Word } from '../../../entities/word.entity';
import { Deck } from '../../../entities/deck.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Word, Deck])],
    controllers: [WordsController],
    providers: [WordsService, GroqService],
    exports: [WordsService],
})
export class WordsModule { }
