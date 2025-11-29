import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { DecksModule } from './features/flashcard/decks/decks.module';
import { WordsModule } from './features/flashcard/words/words.module';
import { SentencesModule } from './features/flashcard/sentences/sentences.module';
import { AIAssistantModule } from './features/flashcard/ai-assistant/ai-assistant.module';

import { DictionaryModule } from './features/dictionary/dictionary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    DecksModule,
    WordsModule,
    SentencesModule,
    AIAssistantModule,
    DictionaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


