import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DictionaryService {
    private readonly baseUrl = 'https://api.faztaa.com/api/search/vi';

    async searchWord(word: string, source_lang: string = 'de') {
        try {
            let pair = 'devi'; // Default DE -> VI
            if (source_lang === 'vi') {
                pair = 'vide'; // VI -> DE
            }

            // Example URL: https://api.faztaa.com/api/search/vi/devi/Hallo?page=1&limit=50
            const url = `${this.baseUrl}/${pair}/${encodeURIComponent(word)}?page=1&limit=50`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://faztaa.com/',
                }
            });

            // If Faztaa returns found: false, try Google Translate
            if (response.data && response.data.found === false) {
                try {
                    // Map source_lang to Google Translate codes
                    // source_lang 'vi' -> sl='vi', tl='de'
                    // source_lang 'de' -> sl='de', tl='vi'
                    const sl = source_lang;
                    const tl = source_lang === 'vi' ? 'de' : 'vi';

                    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&dt=ex&dt=ld&dt=md&dt=qca&dt=rm&dt=ss&sl=${sl}&tl=${tl}&q=${encodeURIComponent(word)}`;

                    const googleResponse = await axios.get(googleUrl);

                    if (googleResponse.data && googleResponse.data.sentences && googleResponse.data.sentences.length > 0) {
                        const translatedText = googleResponse.data.sentences[0].trans;

                        // Construct a response structure similar to Faztaa's success response
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
                    // If Google Translate fails, return original Faztaa response (found: false)
                }
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
