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
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DecksController {
    constructor(private readonly decksService: DecksService) { }

    @Post()
    async create(
        @Request() req,
        @Body() createDeckDto: CreateDeckDto,
    ): Promise<ApiResponse> {
        const deck = await this.decksService.create(
            req.user.id,
            createDeckDto,
            req.user.role,
        );

        return {
            statusCode: 201,
            message: 'Deck created successfully',
            data: deck,
        };
    }

    @Get()
    async findAll(@Request() req): Promise<ApiResponse> {
        const decks = await this.decksService.findAll(req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Decks retrieved successfully',
            data: decks,
        };
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string): Promise<ApiResponse> {
        const deck = await this.decksService.findOne(id, req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Deck retrieved successfully',
            data: deck,
        };
    }

    @Patch(':id')
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateDeckDto: UpdateDeckDto,
    ): Promise<ApiResponse> {
        const deck = await this.decksService.update(
            id,
            req.user.id,
            updateDeckDto,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Deck updated successfully',
            data: deck,
        };
    }

    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string): Promise<ApiResponse> {
        await this.decksService.remove(id, req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Deck deleted successfully',
        };
    }

    @Get(':id/shuffled-ids')
    async getShuffledIds(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        const ids = await this.decksService.getShuffledIds(
            id,
            req.user.id,
            req.user.role,
        );

        // If null, it means deck has <= 200 words, client should load normally
        if (ids === null) {
            return {
                statusCode: 200,
                message: 'Deck has 200 or fewer words, load normally',
                data: { useBatchLoading: false },
            };
        }

        return {
            statusCode: 200,
            message: 'Shuffled word IDs retrieved successfully',
            data: { useBatchLoading: true, ids },
        };
    }

    @Get(':id/word-count')
    async getWordCount(@Param('id') id: string): Promise<ApiResponse> {
        const count = await this.decksService.getWordCount(id);

        return {
            statusCode: 200,
            message: 'Word count retrieved successfully',
            data: { count },
        };
    }

    // ========== PUBLIC SHARING ENDPOINTS (Authenticated) ==========

    /**
     * Enable public sharing for a deck
     */
    @Post(':id/public-share/enable')
    async enablePublicShare(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        const shareInfo = await this.decksService.enablePublicShare(
            id,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Public sharing enabled successfully',
            data: shareInfo,
        };
    }

    /**
     * Disable public sharing for a deck
     */
    @Delete(':id/public-share/disable')
    async disablePublicShare(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        await this.decksService.disablePublicShare(id, req.user.id, req.user.role);

        return {
            statusCode: 200,
            message: 'Public sharing disabled successfully',
        };
    }

    /**
     * Regenerate public share token
     */
    @Post(':id/public-share/regenerate')
    async regeneratePublicShareToken(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        const shareInfo = await this.decksService.regeneratePublicShareToken(
            id,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Public share token regenerated successfully',
            data: shareInfo,
        };
    }

    /**
     * Get public share info
     */
    @Get(':id/public-share/info')
    async getPublicShareInfo(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ApiResponse> {
        const shareInfo = await this.decksService.getPublicShareInfo(
            id,
            req.user.id,
            req.user.role,
        );

        return {
            statusCode: 200,
            message: 'Public share info retrieved successfully',
            data: shareInfo,
        };
    }
}
