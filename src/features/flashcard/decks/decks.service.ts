import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deck } from '../../../entities/deck.entity';
import { UserRole } from '../../../entities/user.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
    constructor(
        @InjectRepository(Deck)
        private readonly deckRepository: Repository<Deck>,
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
}
