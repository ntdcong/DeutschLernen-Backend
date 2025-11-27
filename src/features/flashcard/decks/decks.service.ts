import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Deck } from '../../../entities/deck.entity';
import { UserRole } from '../../../entities/user.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { PublicShareResponseDto } from './dto/public-share-response.dto';
import { PublicDeckResponseDto } from './dto/public-deck-response.dto';

@Injectable()
export class DecksService {
    constructor(
        @InjectRepository(Deck)
        private readonly deckRepository: Repository<Deck>,
        private readonly configService: ConfigService,
    ) { }

    async create(
        userId: string,
        createDeckDto: CreateDeckDto,
        userRole: UserRole,
    ): Promise<Deck> {
        // Only Admin can set isPublic to true
        const isPublic =
            userRole === UserRole.ADMIN && createDeckDto.isPublic === true
                ? true
                : false;

        const deck = this.deckRepository.create({
            ...createDeckDto,
            userId,
            isPublic,
        });

        return await this.deckRepository.save(deck);
    }

    async findAll(userId: string, userRole: UserRole): Promise<any[]> {
        const decks = await this.deckRepository
            .createQueryBuilder('deck')
            .where('deck.userId = :userId', { userId })
            .orWhere('deck.isPublic = :isPublic', { isPublic: true })
            .loadRelationCountAndMap('deck.wordCount', 'deck.words')
            .orderBy('deck.createdAt', 'DESC')
            .getMany();

        return decks;
    }

    async findOne(id: string, userId: string, userRole: UserRole): Promise<any> {
        const deck = await this.deckRepository.findOne({
            where: { id },
            relations: ['words'],
        });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Check access: owner, admin, or public deck
        if (deck.userId !== userId && userRole !== UserRole.ADMIN && !deck.isPublic) {
            throw new ForbiddenException('You do not have access to this deck');
        }

        // Add word count to the response
        const wordCount = deck.words ? deck.words.length : 0;

        return {
            ...deck,
            wordCount,
        };
    }

    async update(
        id: string,
        userId: string,
        updateDeckDto: UpdateDeckDto,
        userRole: UserRole,
    ): Promise<Deck> {
        const deck = await this.deckRepository.findOne({ where: { id } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can update (unless admin)
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only update your own decks');
        }

        // Only Admin can set isPublic to true
        const isPublic =
            userRole === UserRole.ADMIN && updateDeckDto.isPublic === true
                ? true
                : deck.isPublic; // Keep current value if not admin

        Object.assign(deck, { ...updateDeckDto, isPublic });

        return await this.deckRepository.save(deck);
    }

    async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
        const deck = await this.deckRepository.findOne({ where: { id } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can delete (unless admin)
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only delete your own decks');
        }

        await this.deckRepository.remove(deck);
    }

    async getShuffledIds(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<string[] | null> {
        // First verify access to the deck
        const deck = await this.findOne(deckId, userId, userRole);

        // Only use shuffled IDs if deck has more than 200 words
        const wordCount = await this.deckRepository
            .createQueryBuilder('deck')
            .leftJoin('deck.words', 'word')
            .where('deck.id = :deckId', { deckId })
            .getCount();

        if (wordCount <= 200) {
            // Return null to indicate client should load normally
            return null;
        }

        // Get shuffled IDs for large decks
        const words = await this.deckRepository
            .createQueryBuilder('deck')
            .leftJoinAndSelect('deck.words', 'word')
            .where('deck.id = :deckId', { deckId })
            .orderBy('RANDOM()')
            .getOne();

        return words?.words?.map((word) => word.id) || [];
    }

    async getWordCount(deckId: string): Promise<number> {
        const result = await this.deckRepository
            .createQueryBuilder('deck')
            .leftJoin('deck.words', 'word')
            .where('deck.id = :deckId', { deckId })
            .select('COUNT(word.id)', 'count')
            .getRawOne();

        return parseInt(result?.count || '0', 10);
    }

    // ========== PUBLIC SHARING METHODS ==========

    /**
     * Enable public sharing for a deck
     */
    async enablePublicShare(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<PublicShareResponseDto> {
        const deck = await this.deckRepository.findOne({ where: { id: deckId } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can enable public sharing
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only share your own decks');
        }

        // Generate new token if not exists
        if (!deck.publicShareToken) {
            deck.publicShareToken = randomUUID();
        }

        deck.isPublicShareable = true;
        deck.publicShareEnabledAt = new Date();

        await this.deckRepository.save(deck);

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const publicShareUrl = `${frontendUrl}/public/learn/${deck.publicShareToken}`;

        return {
            publicShareToken: deck.publicShareToken!,
            publicShareUrl,
            isPublicShareable: deck.isPublicShareable,
            publicShareEnabledAt: deck.publicShareEnabledAt!,
        };
    }

    /**
     * Disable public sharing for a deck
     */
    async disablePublicShare(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<void> {
        const deck = await this.deckRepository.findOne({ where: { id: deckId } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can disable public sharing
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only manage your own decks');
        }

        deck.isPublicShareable = false;
        deck.publicShareToken = null;
        deck.publicShareEnabledAt = null;

        await this.deckRepository.save(deck);
    }

    /**
     * Regenerate public share token
     */
    async regeneratePublicShareToken(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<PublicShareResponseDto> {
        const deck = await this.deckRepository.findOne({ where: { id: deckId } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can regenerate token
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only manage your own decks');
        }

        if (!deck.isPublicShareable) {
            throw new BadRequestException('Public sharing is not enabled for this deck');
        }

        // Generate new token
        deck.publicShareToken = randomUUID();
        deck.publicShareEnabledAt = new Date();

        await this.deckRepository.save(deck);

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const publicShareUrl = `${frontendUrl}/public/learn/${deck.publicShareToken}`;

        return {
            publicShareToken: deck.publicShareToken!,
            publicShareUrl,
            isPublicShareable: deck.isPublicShareable,
            publicShareEnabledAt: deck.publicShareEnabledAt!,
        };
    }

    /**
     * Get public deck by token (for anonymous users)
     */
    async getPublicDeckByToken(token: string): Promise<PublicDeckResponseDto> {
        const deck = await this.deckRepository.findOne({
            where: {
                publicShareToken: token,
                isPublicShareable: true,
            },
            relations: ['words', 'user'],
        });

        if (!deck) {
            throw new NotFoundException('Public deck not found or sharing is disabled');
        }

        return {
            id: deck.id,
            name: deck.name,
            wordCount: deck.words?.length || 0,
            createdAt: deck.createdAt,
            owner: {
                id: deck.user.id,
                username: deck.user.fullName,
                email: deck.user.email,
            },
            words: deck.words.map((word) => ({
                id: word.id,
                german: word.word,
                vietnamese: word.meaning,
                example: null, // Word entity doesn't have example field
            })),
        };
    }

    /**
     * Get public share info for a deck (for deck owner)
     */
    async getPublicShareInfo(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<PublicShareResponseDto | null> {
        const deck = await this.deckRepository.findOne({ where: { id: deckId } });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can view share info
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only view info for your own decks');
        }

        if (!deck.isPublicShareable || !deck.publicShareToken) {
            return null;
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const publicShareUrl = `${frontendUrl}/public/learn/${deck.publicShareToken}`;

        return {
            publicShareToken: deck.publicShareToken,
            publicShareUrl,
            isPublicShareable: deck.isPublicShareable,
            publicShareEnabledAt: deck.publicShareEnabledAt!,
        };
    }
}
