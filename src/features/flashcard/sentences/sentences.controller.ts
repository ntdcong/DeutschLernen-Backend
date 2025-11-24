import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('flashcard/sentences')
@UseGuards(JwtAuthGuard)
export class SentencesController {
    constructor(private readonly sentencesService: SentencesService) { }

    @Post()
    async create(@Body() createSentenceDto: CreateSentenceDto, @Request() req) {
        const sentence = await this.sentencesService.create(
            createSentenceDto,
            req.user.id,
        );
        return {
            statusCode: 201,
            message: 'Sentence created successfully',
            data: sentence,
        };
    }

    @Get('word/:wordId')
    async findByWord(@Param('wordId') wordId: string) {
        const sentences = await this.sentencesService.findByWord(wordId);
        return {
            statusCode: 200,
            message: 'Sentences retrieved successfully',
            data: sentences,
        };
    }

    @Get('favorites')
    async findFavorites(@Request() req) {
        const sentences = await this.sentencesService.findFavorites(req.user.id);
        return {
            statusCode: 200,
            message: 'Favorite sentences retrieved successfully',
            data: sentences,
        };
    }

    @Patch(':id/favorite')
    async toggleFavorite(@Param('id') id: string, @Request() req) {
        const sentence = await this.sentencesService.toggleFavorite(
            id,
            req.user.id,
        );
        return {
            statusCode: 200,
            message: 'Favorite status toggled successfully',
            data: sentence,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateSentenceDto: UpdateSentenceDto,
        @Request() req,
    ) {
        const sentence = await this.sentencesService.update(
            id,
            updateSentenceDto,
            req.user.id,
        );
        return {
            statusCode: 200,
            message: 'Sentence updated successfully',
            data: sentence,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        await this.sentencesService.remove(id, req.user.id);
        return {
            statusCode: 200,
            message: 'Sentence deleted successfully',
        };
    }
}
