import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groq from 'groq-sdk';
import { Word } from '../../../entities/word.entity';
import { SentencesService } from '../sentences/sentences.service';
import { AIRequestDto } from './dto/ai-request.dto';

@Injectable()
export class AIAssistantService {
    private groq: Groq;
    private readonly FAST_MODEL = 'llama-3.1-8b-instant';
    private readonly SMART_MODEL = 'llama-3.3-70b-versatile';

    constructor(
        @InjectRepository(Word)
        private wordsRepository: Repository<Word>,
        private sentencesService: SentencesService,
    ) {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    private async getWord(wordId: string): Promise<Word> {
        const word = await this.wordsRepository.findOne({
            where: { id: wordId },
        });

        if (!word) {
            throw new NotFoundException(`Word with ID ${wordId} not found`);
        }

        return word;
    }

    async generateSentence(dto: AIRequestDto, userId: string) {
        const word = await this.getWord(dto.wordId);
        const difficulty = dto.difficulty || 'A2-B1';

        const prompt = `Create ONE German sentence using "${word.word}" (${word.meaning}).
Level: ${difficulty}
Format as JSON: 
{
  "sentence": "German sentence here",
  "translation": "Vietnamese translation",
  "grammarNote": "Brief note about grammar used (in Vietnamese)"
}
Make it natural and useful for learners.`;

        try {
            const result = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.FAST_MODEL, // Fast model for simple task
                temperature: 0.8,
                response_format: { type: 'json_object' },
            });

            const content = result.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from AI');
            }

            const data = JSON.parse(content);

            // Save sentence to database
            const savedSentence = await this.sentencesService.create(
                {
                    wordId: dto.wordId,
                    german: data.sentence,
                    vietnamese: data.translation,
                    grammarNote: data.grammarNote,
                    difficulty: difficulty,
                    source: 'ai-generated',
                },
                userId,
            );

            return {
                ...data,
                sentenceId: savedSentence.id,
            };
        } catch (error) {
            throw new Error(`Failed to generate sentence: ${error.message}`);
        }
    }

    async getFunFacts(dto: AIRequestDto) {
        const word = await this.getWord(dto.wordId);

        const prompt = `Cho tôi 3-5 điều thú vị về từ tiếng Đức "${word.word}":
- Nguồn gốc và etymology
- Ý nghĩa văn hóa
- Các từ ghép liên quan
- Mẹo ghi nhớ hay
- Lịch sử thú vị (nếu có)

Viết bằng tiếng Việt, sinh động và dễ hiểu. Format markdown với bullet points.`;

        try {
            const result = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.SMART_MODEL, // Smart model for creative content
                temperature: 0.7,
            });

            return {
                facts: result.choices[0].message.content,
            };
        } catch (error) {
            throw new Error(`Failed to generate fun facts: ${error.message}`);
        }
    }

    async getEtymology(dto: AIRequestDto) {
        const word = await this.getWord(dto.wordId);

        const prompt = `Giải thích chi tiết nguồn gốc từ ngữ (etymology) của từ tiếng Đức "${word.word}":
- Gốc từ (Germanic, Latin, Greek, etc.)
- Sự phát triển lịch sử của từ
- Từ liên quan trong các ngôn ngữ khác (English, French, etc.)
- Sự thay đổi về nghĩa qua thời gian

Viết bằng tiếng Việt, chi tiết nhưng dễ hiểu. Dùng format markdown.`;

        try {
            const result = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.SMART_MODEL, // Smart model for detailed explanation
                temperature: 0.5,
            });

            return {
                etymology: result.choices[0].message.content,
            };
        } catch (error) {
            throw new Error(`Failed to generate etymology: ${error.message}`);
        }
    }

    async getCommonPhrases(dto: AIRequestDto) {
        const word = await this.getWord(dto.wordId);

        const prompt = `Liệt kê 5 cụm từ / thành ngữ tiếng Đức thường dùng với "${word.word}".
Format cho mỗi cụm:
**[Tiếng Đức]**
→ [Tiếng Việt]
Ví dụ: [Câu ví dụ]

Chọn những cụm thực tế và hữu ích nhất.`;

        try {
            const result = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.FAST_MODEL, // Fast model for list generation
                temperature: 0.6,
            });

            return {
                phrases: result.choices[0].message.content,
            };
        } catch (error) {
            throw new Error(`Failed to generate phrases: ${error.message}`);
        }
    }

    async getCommonMistakes(dto: AIRequestDto) {
        const word = await this.getWord(dto.wordId);

        const prompt = `Liệt kê 3-5 lỗi phổ biến người học tiếng Đức hay mắc khi dùng từ "${word.word}" (${word.meaning}):
- Nhầm lẫn về giống từ (der/die/das)
- Lỗi biến cách (Nominativ, Akkusativ, Dativ, Genitiv)
- Nhầm với từ tương tự
- Lỗi phát âm
- Lỗi cách dùng

Cho mỗi lỗi:
❌ **Sai:** [ví dụ sai]
✅ **Đúng:** [ví dụ đúng]
💡 **Giải thích:** [lý do]

Viết bằng tiếng Việt.`;

        try {
            const result = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.FAST_MODEL, // Fast model for tips
                temperature: 0.6,
            });

            return {
                mistakes: result.choices[0].message.content,
            };
        } catch (error) {
            throw new Error(`Failed to generate common mistakes: ${error.message}`);
        }
    }
}
