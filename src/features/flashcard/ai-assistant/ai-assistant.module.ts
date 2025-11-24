import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIAssistantService } from './ai-assistant.service';
import { AIAssistantController } from './ai-assistant.controller';
import { Word } from '../../../entities/word.entity';
import { SentencesModule } from '../sentences/sentences.module';

@Module({
    imports: [TypeOrmModule.forFeature([Word]), SentencesModule],
    controllers: [AIAssistantController],
    providers: [AIAssistantService],
    exports: [AIAssistantService],
})
export class AIAssistantModule { }
