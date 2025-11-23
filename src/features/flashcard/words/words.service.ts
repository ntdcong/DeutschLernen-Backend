import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Word } from '../../../entities/word.entity';
import { Deck } from '../../../entities/deck.entity';
import { UserRole } from '../../../entities/user.entity';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { GroqService, GeneratedWord } from './groq.service';
import * as XLSX from 'xlsx';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(Word)
        private readonly wordRepository: Repository<Word>,
        @InjectRepository(Deck)
        private readonly deckRepository: Repository<Deck>,
        private readonly groqService: GroqService,
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

    async importFromFile(
        userId: string,
        deckId: string,
        file: Express.Multer.File,
        userRole: UserRole,
    ): Promise<{ imported: number; failed: number; errors: string[] }> {
        // Verify deck exists and user has access
        const deck = await this.deckRepository.findOne({
            where: { id: deckId },
        });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can add words (unless admin)
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only add words to your own decks');
        }

        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

        if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
            throw new BadRequestException(
                'Invalid file format. Only Excel (.xlsx, .xls) and CSV files are supported',
            );
        }

        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data: any[] = XLSX.utils.sheet_to_json(worksheet);

            let imported = 0;
            let failed = 0;
            const errors: string[] = [];

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    // Expected columns: word, meaning, genus (optional), plural (optional), audioUrl (optional)
                    if (!row.word || !row.meaning) {
                        errors.push(
                            `Row ${i + 2}: Missing required fields (word or meaning)`,
                        );
                        failed++;
                        continue;
                    }

                    const word = this.wordRepository.create({
                        deckId: deckId,
                        word: row.word.toString().trim(),
                        meaning: row.meaning.toString().trim(),
                        genus: row.genus ? row.genus.toString().trim() : undefined,
                        plural: row.plural ? row.plural.toString().trim() : undefined,
                        audioUrl: row.audioUrl
                            ? row.audioUrl.toString().trim()
                            : undefined,
                        isLearned: false,
                    });

                    await this.wordRepository.save(word);
                    imported++;
                } catch (error) {
                    errors.push(`Row ${i + 2}: ${error.message}`);
                    failed++;
                }
            }

            return { imported, failed, errors };
        } catch (error) {
            throw new BadRequestException(
                `Failed to parse file: ${error.message}`,
            );
        }
    }

    async generateWithAI(
        userId: string,
        deckId: string,
        topic: string,
        count: number,
        level: string,
        userRole: UserRole,
    ): Promise<Word[]> {
        // Verify deck exists and user has access
        const deck = await this.deckRepository.findOne({
            where: { id: deckId },
        });

        if (!deck) {
            throw new NotFoundException('Deck not found');
        }

        // Only owner can add words (unless admin)
        if (deck.userId !== userId && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only add words to your own decks');
        }

        try {
            // Generate words using Groq AI
            const generatedWords: GeneratedWord[] =
                await this.groqService.generateWords(topic, count, level);

            // Save generated words to database
            const savedWords: Word[] = [];
            for (const genWord of generatedWords) {
                const word = this.wordRepository.create({
                    deckId: deckId,
                    word: genWord.word,
                    meaning: genWord.meaning,
                    genus: genWord.genus,
                    plural: genWord.plural,
                    isLearned: false,
                });

                const saved = await this.wordRepository.save(word);
                savedWords.push(saved);
            }

            return savedWords;
        } catch (error) {
            throw new BadRequestException(
                `Failed to generate words: ${error.message}`,
            );
        }
    }
}
