import { Controller, Get, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { SearchWordDto } from './dto/search-word.dto';

@Controller('dictionary')
export class DictionaryController {
    constructor(private readonly dictionaryService: DictionaryService) { }

    @Get('search')
    async search(@Query() query: SearchWordDto) {
        return this.dictionaryService.searchWord(query.word, query.source_lang);
    }
}
