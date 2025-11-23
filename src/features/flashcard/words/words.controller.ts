import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { BatchWordsDto } from './dto/batch-words.dto';
import { GenerateWordsDto } from './dto/generate-words.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';

@Controller('words')
@UseGuards(JwtAuthGuard)
export class WordsController {
    constructor(private readonly wordsService: WordsService) { }

    @Post()
    async create(
        @Request() req,
        @Body() createWordDto: CreateWordDto,
    ): Promise<ApiResponse> {
        const word = await this.wordsService.create(
            req.user.id,
            createWordDto,
            req.user.role,
        );

        return {
            statusCode: 201,
            message: 'Word created successfully',
            data: word,
        };
    }

    @Get('deck/:deckId')
    async findAllByDeck(
        @Request() req,
        @Param('deckId') deckId: string,
    ): Promise<ApiResponse> {
        const words = await this.wordsService.findAllByDeck(
            deckId,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Words retrieved successfully',
            data: words,
        };
    }

    @Post('batch')
    async findBatch(
        @Request() req,
        @Body() batchWordsDto: BatchWordsDto,
    ): Promise<ApiResponse> {
        const words = await this.wordsService.findBatch(
            batchWordsDto.ids,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Words batch retrieved successfully',
            data: words,
        };
    }

    @Post('import/:deckId')
    @UseInterceptors(FileInterceptor('file'))
    async importFromFile(
        @Request() req,
        @Param('deckId') deckId: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ApiResponse> {
        if (!file) {
            return {
                statusCode: 400,
                message: 'No file uploaded',
            };
        }

        const result = await this.wordsService.importFromFile(
            req.user.id,
            deckId,
            file,
            req.user.role,
        );

        return {
            statusCode: 201,
            message: `Import completed. ${result.imported} words imported, ${result.failed} failed`,
            data: result,
        };
    }

    @Post('generate')
    async generateWithAI(
        @Request() req,
        @Body() generateWordsDto: GenerateWordsDto,
    ): Promise<ApiResponse> {
        const words = await this.wordsService.generateWithAI(
            req.user.id,
            generateWordsDto.deckId,
            generateWordsDto.topic,
            generateWordsDto.count,
            generateWordsDto.level || 'A1',
            req.user.role,
        );

        return {
            statusCode: 201,
            message: `Successfully generated ${words.length} words using AI`,
            data: words,
        };
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string): Promise<ApiResponse> {
        const word = await this.wordsService.findOne(id, req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Word retrieved successfully',
            data: word,
        };
    }

    @Patch(':id')
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateWordDto: UpdateWordDto,
    ): Promise<ApiResponse> {
        const word = await this.wordsService.update(
            id,
            req.user.id,
            updateWordDto,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Word updated successfully',
            data: word,
        };
    }

    @Patch(':id/toggle-learned')
    async toggleLearned(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        const word = await this.wordsService.toggleLearned(
            id,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Word learned status toggled successfully',
            data: word,
        };
    }

    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string): Promise<ApiResponse> {
        await this.wordsService.remove(id, req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Word deleted successfully',
        };
    }
}
