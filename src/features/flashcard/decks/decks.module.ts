import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { Deck } from '../../../entities/deck.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Deck])],
    controllers: [DecksController],
    providers: [DecksService],
    exports: [DecksService],
})
export class DecksModule { }
