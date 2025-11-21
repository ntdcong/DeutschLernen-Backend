import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Word } from '../../../entities/word.entity';
import { Deck } from '../../../entities/deck.entity';
import { UserRole } from '../../../entities/user.entity';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(Word)
        private readonly wordRepository: Repository<Word>,
        @InjectRepository(Deck)
        private readonly deckRepository: Repository<Deck>,
    ) { }

    async create(
        userId: string,
        createWordDto: CreateWordDto,
        userRole: UserRole,
    ): Promise<Word> {
        // Verify deck exists and user has access
        const deck = await this.deckRepository.findOne({
            where: { id: createWordDto.deckId },
        });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can add words (unless admin)
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only add words to your own decks');
        }

        const word = this.wordRepository.create(createWordDto);
        return await this.wordRepository.save(word);
    }

    async findAllByDeck(
        deckId: string,
        userId: string,
        userRole: UserRole,
    ): Promise<Word[]> {
        // Verify deck access
        const deck = await this.deckRepository.findOne({
            where: { id: deckId },
        });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Check access: owner, admin, or public deck
        if (deck.userId !== userId && userRole !== UserRole.ADMIN && !deck.isPublic) {
            throw new ForbiddenException('You do not have access to this deck');
        }

        return await this.wordRepository.find({
            where: { deckId },
            order: { createdAt: 'ASC' },
        });
    }

    async findOne(id: string, userId: string, userRole: UserRole): Promise<Word> {
        const word = await this.wordRepository.findOne({
            where: { id },
            relations: ['deck'],
        });

        if (!word) {
            throw new NotFoundException('Word not found');
        }

        // Check deck access
        const deck = word.deck;
        if (deck.userId !== userId && userRole !== UserRole.ADMIN && !deck.isPublic) {
            throw new ForbiddenException('You do not have access to this word');
        }

        return word;
    }

    async findBatch(
        ids: string[],
        userId: string,
        userRole: UserRole,
    ): Promise<Word[]> {
        const words = await this.wordRepository.find({
            where: { id: In(ids) },
            relations: ['deck'],
        });

        // Verify access to all words
        for (const word of words) {
            const deck = word.deck;
            if (deck.userId !== userId && userRole !== UserRole.ADMIN && !deck.isPublic) {
                throw new ForbiddenException(
                    `You do not have access to word: ${word.id}`,
                );
            }
        }

        // Return in the same order as requested IDs
        const wordMap = new Map(words.map((w) => [w.id, w]));
        return ids.map((id) => wordMap.get(id)).filter((w) => w !== undefined);
    }

    async update(
        id: string,
        userId: string,
        updateWordDto: UpdateWordDto,
        userRole: UserRole,
    ): Promise<Word> {
        const word = await this.wordRepository.findOne({
            where: { id },
            relations: ['deck'],
        });

        if (!word) {
            throw new NotFoundException('Word not found');
        }

        // Only owner can update (unless admin)
        if (word.deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only update words in your own decks');
        }

        Object.assign(word, updateWordDto);
        return await this.wordRepository.save(word);
    }

    async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
        const word = await this.wordRepository.findOne({
            where: { id },
            relations: ['deck'],
        });

        if (!word) {
            throw new NotFoundException('Word not found');
        }

        // Only owner can delete (unless admin)
        if (word.deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only delete words from your own decks');
        }

        await this.wordRepository.remove(word);
    }

    async toggleLearned(
        id: string,
        userId: string,
        userRole: UserRole,
    ): Promise<Word> {
        const word = await this.wordRepository.findOne({
            where: { id },
            relations: ['deck'],
        });

        if (!word) {
            throw new NotFoundException('Word not found');
        }

        // Only owner can toggle (unless admin)
        if (word.deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException(
                'You can only toggle learned status for words in your own decks',
            );
        }

        word.isLearned = !word.isLearned;
        return await this.wordRepository.save(word);
    }
}
