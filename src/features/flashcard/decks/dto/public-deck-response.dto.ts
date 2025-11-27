export class PublicDeckResponseDto {
    id: string;
    name: string;
    wordCount: number;
    createdAt: Date;
    owner: {
        id: string;
        username: string;
        email: string;
    };
    words: {
        id: string;
        german: string;
        vietnamese: string;
        example: string | null;
    }[];
}
