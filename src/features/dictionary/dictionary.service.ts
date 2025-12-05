import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DictionaryService {
    private readonly baseUrl = 'https://api.faztaa.com/api/search/vi';

    /**
     * Helper method to translate using Google Translate API
     */
    private async translateWithGoogle(word: string, source_lang: string, pair: string): Promise<any | null> {
        try {
            const sl = source_lang;
            const tl = source_lang === 'vi' ? 'de' : 'vi';

            const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&dt=ex&dt=ld&dt=md&dt=qca&dt=rm&dt=ss&sl=${sl}&tl=${tl}&q=${encodeURIComponent(word)}`;

            const googleResponse = await axios.get(googleUrl);

            if (googleResponse.data && googleResponse.data.sentences && googleResponse.data.sentences.length > 0) {
                // Combine all translated sentences
                const translatedText = googleResponse.data.sentences
                    .filter((s: any) => s.trans)
                    .map((s: any) => s.trans)
                    .join('');

                return {
                    found: true,
                    key: word,
                    type: 'google_translate',
                    result: [{
                        word: word,
                        id: 0,
                        language: source_lang,
                        type: pair,
                        content: [{
                            kind: "Dịch tự động (Google Translate)",
                            means: [{
                                mean: translatedText,
                                examples: []
                            }]
                        }],
                        _id: "google_translate",
                        pronounce: {}
                    }]
                };
            }
        } catch (googleError) {
            console.error('Error fetching from Google Translate:', googleError);
        }
        return null;
    }

    /**
     * Check if input is a long phrase (more than 2 words) that should be translated as a sentence
     */
    private isLongPhrase(text: string): boolean {
        // Trim and check if there are more than 2 words separated by spaces
        // Single words and 2-word compounds should still go through Faztaa
        const words = text.trim().split(/\s+/);
        return words.length > 2;
    }

    async searchWord(word: string, source_lang: string = 'de') {
        try {
            let pair = 'devi'; // Default DE -> VI
            if (source_lang === 'vi') {
                pair = 'vide'; // VI -> DE
            }

            // If input is a long phrase (more than 2 words), use Google Translate directly
            // This provides better translation for sentences/phrases
            if (this.isLongPhrase(word)) {
                const googleResult = await this.translateWithGoogle(word, source_lang, pair);
                if (googleResult) {
                    return googleResult;
                }
                // If Google Translate fails, still try Faztaa as fallback
            }

            // Example URL: https://api.faztaa.com/api/search/vi/devi/Hallo?page=1&limit=50
            const url = `${this.baseUrl}/${pair}/${encodeURIComponent(word)}?page=1&limit=50`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://faztaa.com/',
                }
            });

            const data = response.data;

            // If Faztaa returns any useful results (in the result array), return them
            // This handles cases like "ging" where found=false but result contains "Gehen"
            const hasUsefulResults = data && data.result && Array.isArray(data.result) && data.result.length > 0;

            if (data && (data.found === true || data.found_related === true || hasUsefulResults)) {
                return data;
            }

            // Only use Google Translate as fallback when Faztaa returns nothing useful
            // (no results in the result array)
            const googleResult = await this.translateWithGoogle(word, source_lang, pair);
            if (googleResult) {
                return googleResult;
            }

            return response.data;

        } catch (error) {
            console.error('Error fetching from Faztaa:', error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw new HttpException(error.response.data, error.response.status);
                }
            }
            throw new HttpException('Failed to fetch dictionary data', HttpStatus.BAD_GATEWAY);
        }
    }
}
