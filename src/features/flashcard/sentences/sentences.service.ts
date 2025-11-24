import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sentence } from '../../../entities/sentence.entity';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';

@Injectable()
export class SentencesService {
    constructor(
        @InjectRepository(Sentence)
        private sentencesRepository: Repository<Sentence>,
    ) { }

    async create(createSentenceDto: CreateSentenceDto, userId: string): Promise<Sentence> {
        const sentence = this.sentencesRepository.create({
            ...createSentenceDto,
            userId,
        });

        return await this.sentencesRepository.save(sentence);
    }

    async findByWord(wordId: string): Promise<Sentence[]> {
        return await this.sentencesRepository.find({
            where: { wordId },
            order: { createdAt: 'DESC' },
        });
    }

    async findFavorites(userId: string): Promise<Sentence[]> {
        return await this.sentencesRepository.find({
            where: { userId, isFavorite: true },
            relations: ['word'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Sentence> {
        const sentence = await this.sentencesRepository.findOne({
            where: { id },
        });

        if (!sentence) {
            throw new NotFoundException(`Sentence with ID ${id} not found`);
        }

        return sentence;
    }

    async toggleFavorite(id: string, userId: string): Promise<Sentence> {
        const sentence = await this.findOne(id);

        // Check if user owns this sentence
        if (sentence.userId !== userId) {
            throw new ForbiddenException('You can only modify your own sentences');
        }

        sentence.isFavorite = !sentence.isFavorite;
        return await this.sentencesRepository.save(sentence);
    }

    async update(id: string, updateSentenceDto: UpdateSentenceDto, userId: string): Promise<Sentence> {
        const sentence = await this.findOne(id);

        // Check if user owns this sentence
        if (sentence.userId !== userId) {
            throw new ForbiddenException('You can only modify your own sentences');
        }

        Object.assign(sentence, updateSentenceDto);
        return await this.sentencesRepository.save(sentence);
    }

    async remove(id: string, userId: string): Promise<void> {
        const sentence = await this.findOne(id);

        // Check if user owns this sentence
        if (sentence.userId !== userId) {
            throw new ForbiddenException('You can only delete your own sentences');
        }

        await this.sentencesRepository.remove(sentence);
    }
}
