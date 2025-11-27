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
import { User } from './user.entity';
import { Word } from './word.entity';

@Entity('decks')
export class Deck {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, (user) => user.decks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'is_public', default: false })
    isPublic: boolean;

    @Column({ name: 'public_share_token', type: 'varchar', nullable: true, unique: true })
    publicShareToken: string | null;

    @Column({ name: 'is_public_shareable', default: false })
    isPublicShareable: boolean;

    @Column({ name: 'public_share_enabled_at', type: 'timestamp', nullable: true })
    publicShareEnabledAt: Date | null;

    @OneToMany(() => Word, (word) => word.deck, { cascade: true })
    words: Word[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
