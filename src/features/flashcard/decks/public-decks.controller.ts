import {
    Controller,
    Get,
    Param,
    Query,
    Res,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DecksService } from './decks.service';
import { QRCodeService } from './qrcode.service';
import { QROptionsDto, QRType } from './dto/qr-options.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';

/**
 * Public controller for accessing shared decks
 * No authentication required
 */
@Controller('public/decks')
export class PublicDecksController {
    constructor(
        private readonly decksService: DecksService,
        private readonly qrCodeService: QRCodeService,
    ) { }

    /**
     * Get public deck by token (for anonymous users)
     */
    @Get(':token')
    async getPublicDeck(@Param('token') token: string): Promise<ApiResponse> {
        const deck = await this.decksService.getPublicDeckByToken(token);

        return {
            statusCode: 200,
            message: 'Public deck retrieved successfully',
            data: deck,
        };
    }

    /**
     * Generate QR code for public deck
     */
    @Get(':token/qr')
    async getQRCode(
        @Param('token') token: string,
        @Query() options: QROptionsDto,
        @Res() res: Response,
    ): Promise<void> {
        // First verify the deck exists and is shareable
        const deck = await this.decksService.getPublicDeckByToken(token);

        // Build the public URL
        const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/public/learn/${token}`;

        // Generate QR code
        const qrType = options.type || QRType.SIMPLE;
        const size = options.size || 300;

        const qrDataUrl = await this.qrCodeService.generateQRCode(publicUrl, {
            type: qrType,
            size,
        });

        // Return as image or data URL
        res.setHeader('Content-Type', 'application/json');
        res.status(HttpStatus.OK).json({
            statusCode: 200,
            message: 'QR code generated successfully',
            data: {
                qrCode: qrDataUrl,
                deckName: deck.name,
                url: publicUrl,
            },
        });
    }

    /**
     * Download QR code as PNG
     */
    @Get(':token/qr/download')
    async downloadQRCode(
        @Param('token') token: string,
        @Query() options: QROptionsDto,
        @Res() res: Response,
    ): Promise<void> {
        // Verify deck exists
        const deck = await this.decksService.getPublicDeckByToken(token);

        // Build URL
        const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/public/learn/${token}`;

        // Generate QR as buffer
        const qrBuffer = await this.qrCodeService.generateQRCodeBuffer(publicUrl, {
            type: options.type || QRType.SIMPLE,
            size: options.size || 300,
        });

        // Set headers for download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="qr-${deck.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png"`,
        );
        res.send(qrBuffer);
    }
}
