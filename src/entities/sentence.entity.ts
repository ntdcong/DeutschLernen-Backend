import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Word } from './word.entity';
import { User } from './user.entity';

@Entity('sentences')
export class Sentence {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'word_id' })
    wordId: string;

    @ManyToOne(() => Word, (word) => word.sentences, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'word_id' })
    word: Word;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('text')
    german: string;

    @Column('text')
    vietnamese: string;

    @Column({ name: 'grammar_note', nullable: true, type: 'text' })
    grammarNote: string;

    @Column({ nullable: true })
    difficulty: string; // A1, A2, B1, B2, C1

    @Column({ name: 'is_favorite', default: false })
    isFavorite: boolean;

    @Column({ default: 'ai-generated' })
    source: string; // 'ai-generated' | 'user-created'

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
