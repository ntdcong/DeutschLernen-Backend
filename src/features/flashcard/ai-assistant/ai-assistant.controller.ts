import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AIAssistantService } from './ai-assistant.service';
import { AIRequestDto } from './dto/ai-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('flashcard/ai')
@UseGuards(JwtAuthGuard)
export class AIAssistantController {
    constructor(private readonly aiAssistantService: AIAssistantService) { }

    @Post('generate-sentence')
    async generateSentence(@Body() dto: AIRequestDto, @Request() req) {
        const result = await this.aiAssistantService.generateSentence(
            dto,
            req.user.id,
        );
        return {
            statusCode: 200,
            message: 'Sentence generated successfully',
            data: result,
        };
    }

    @Post('fun-facts')
    async getFunFacts(@Body() dto: AIRequestDto) {
        const result = await this.aiAssistantService.getFunFacts(dto);
        return {
            statusCode: 200,
            message: 'Fun facts retrieved successfully',
            data: result,
        };
    }

    @Post('etymology')
    async getEtymology(@Body() dto: AIRequestDto) {
        const result = await this.aiAssistantService.getEtymology(dto);
        return {
            statusCode: 200,
            message: 'Etymology retrieved successfully',
            data: result,
        };
    }

    @Post('phrases')
    async getCommonPhrases(@Body() dto: AIRequestDto) {
        const result = await this.aiAssistantService.getCommonPhrases(dto);
        return {
            statusCode: 200,
            message: 'Common phrases retrieved successfully',
            data: result,
        };
    }

    @Post('common-mistakes')
    async getCommonMistakes(@Body() dto: AIRequestDto) {
        const result = await this.aiAssistantService.getCommonMistakes(dto);
        return {
            statusCode: 200,
            message: 'Common mistakes retrieved successfully',
            data: result,
        };
    }
}
