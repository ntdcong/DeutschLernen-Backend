import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, fullName, role } = registerDto;

        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Create new user
        const user = await this.usersService.create(email, password, fullName, role);

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            message: 'Registration successful',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            },
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            message: 'Login successful',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            },
        };
    }

    async refreshToken(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            message: 'Token refreshed successfully',
            data: tokens,
        };
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
        const jwtExpiresIn = parseInt(this.configService.get<string>('JWT_EXPIRES_IN') || '3600');
        const refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET') || 'default-refresh-secret';
        const refreshExpiresIn = parseInt(this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '604800');

        const accessToken = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: jwtExpiresIn,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn,
        });

        return {
            accessToken,
            expiresIn: jwtExpiresIn,
            refreshToken,
            tokenType: 'Bearer',
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not
            return {
                message: 'If the email exists, a password reset link has been sent',
                data: null,
            };
        }

        // Generate reset token
        const resetToken = randomUUID();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.usersService.saveResetToken(user.id, resetToken, resetExpires);

        // TODO: Send email with reset token
        // For now, return the token in the response (remove this in production)
        return {
            message: 'Password reset token generated',
            data: {
                resetToken, // Remove this in production
                message: 'In production, this token would be sent via email',
            },
        };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);

        if (!user || !user.resetPasswordExpires) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        if (new Date() > user.resetPasswordExpires) {
            throw new BadRequestException('Reset token has expired');
        }

        await this.usersService.updatePassword(user.id, newPassword);

        return {
            message: 'Password reset successful',
            data: null,
        };
    }
}
