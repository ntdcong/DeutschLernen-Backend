import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as sharp from 'sharp';

export interface QRCodeOptions {
    type: 'simple' | 'custom';
    size?: number;
    avatarUrl?: string;
}

@Injectable()
export class QRCodeService {
    /**
     * Generate QR code as data URL
     */
    async generateQRCode(
        url: string,
        options: QRCodeOptions = { type: 'simple', size: 300 },
    ): Promise<string> {
        const size = options.size || 300;

        if (options.type === 'simple') {
            return await this.generateSimpleQR(url, size);
        } else {
            return await this.generateCustomQR(url, size, options.avatarUrl);
        }
    }

    /**
     * Generate simple black & white QR code
     */
    private async generateSimpleQR(url: string, size: number): Promise<string> {
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: size,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
            errorCorrectionLevel: 'H', // High error correction for better scanning
        });

        return qrDataUrl;
    }

    /**
     * Generate custom QR code with optional avatar overlay
     * For now, returns styled QR. Avatar overlay can be implemented later
     */
    private async generateCustomQR(
        url: string,
        size: number,
        avatarUrl?: string,
    ): Promise<string> {
        // Generate QR with custom styling
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: size,
            margin: 2,
            color: {
                dark: '#1e293b', // Dark slate
                light: '#f1f5f9', // Light gray
            },
            errorCorrectionLevel: 'H',
        });

        // TODO: Add avatar overlay in future
        // For now, return styled QR code
        // If you want to add avatar, use sharp to overlay:
        // 1. Convert qrDataUrl to buffer
        // 2. Download avatar image
        // 3. Resize avatar to ~1/5 of QR size
        // 4. Composite avatar onto center of QR
        // 5. Convert back to data URL

        return qrDataUrl;
    }

    /**
     * Generate QR code as Buffer (for downloads)
     */
    async generateQRCodeBuffer(
        url: string,
        options: QRCodeOptions = { type: 'simple', size: 300 },
    ): Promise<Buffer> {
        const size = options.size || 300;

        const qrBuffer = await QRCode.toBuffer(url, {
            width: size,
            margin: 2,
            errorCorrectionLevel: 'H',
        });

        return qrBuffer;
    }
}
