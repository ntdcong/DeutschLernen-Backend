import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface GeneratedWord {
    word: string;
    meaning: string;
    genus?: string;
    plural?: string;
}

@Injectable()
export class GroqService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    async generateWords(
        topic: string,
        count: number,
        level: string = 'A1',
    ): Promise<GeneratedWord[]> {
        const prompt = `Generate ${count} German vocabulary words related to "${topic}" at ${level} level.
For each word, provide:
1. The German word (with article for nouns: der/die/das)
2. Vietnamese meaning
3. Genus (if it's a noun: der/die/das)
4. Plural form (if it's a noun)

Format your response as a JSON array with this structure:
[
  {
    "word": "der Apfel",
    "meaning": "quả táo",
    "genus": "der",
    "plural": "die Äpfel"
  }
]

Important:
- For nouns, include the article in the word field
- For verbs, use infinitive form
- For adjectives, use base form
- Only return valid JSON, no additional text`;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a German language teacher helping students learn vocabulary. Always respond with valid JSON only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 2048,
            });

            const content = completion.choices[0]?.message?.content || '[]';

            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            const jsonString = jsonMatch ? jsonMatch[0] : '[]';

            const words: GeneratedWord[] = JSON.parse(jsonString);
            return words;
        } catch (error) {
            console.error('Error generating words with Groq:', error);
            throw new Error('Failed to generate words using AI');
        }
    }
}
