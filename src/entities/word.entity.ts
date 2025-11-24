import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Deck } from './deck.entity';
import { Sentence } from './sentence.entity';

@Entity('words')
export class Word {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'deck_id' })
    deckId: string;

    @ManyToOne(() => Deck, (deck) => deck.words, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deck_id' })
    deck: Deck;

    @Column()
    word: string;

    @Column()
    meaning: string;

    @Column({ nullable: true })
    genus: string;

    @Column({ nullable: true })
    plural: string;

    @Column({ name: 'audio_url', nullable: true })
    audioUrl: string;

    @Column({ name: 'is_learned', default: false })
    isLearned: boolean;

    @OneToMany(() => Sentence, (sentence) => sentence.word)
    sentences: Sentence[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
