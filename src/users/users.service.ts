import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(
        email: string,
        password: string,
        fullName: string,
        role?: string,
    ): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            fullName,
            role: role as any,
        });
        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
        });
    }

    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        await this.usersRepository.update(id, updateData);
        return this.findById(id);
    }

    async saveResetToken(
        userId: string,
        token: string,
        expires: Date,
    ): Promise<void> {
        await this.usersRepository.update(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });
    }

    async findByResetToken(token: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { resetPasswordToken: token },
        });
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(userId, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
}
