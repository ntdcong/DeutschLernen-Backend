import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { PublicDecksController } from './public-decks.controller';
import { QRCodeService } from './qrcode.service';
import { Deck } from '../../../entities/deck.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Deck])],
    controllers: [DecksController, PublicDecksController],
    providers: [DecksService, QRCodeService],
    exports: [DecksService],
})
export class DecksModule { }
