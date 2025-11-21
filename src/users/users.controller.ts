import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(@Request() req) {
        const users = await this.usersService.findAll();
        const currentUser = req.user;

        // If user is admin, return full data
        if (currentUser.role === UserRole.ADMIN) {
            return {
                message: 'Users retrieved successfully',
                data: users,
            };
        }

        // For non-admin users, return only id and fullName
        const filteredUsers = users.map((user) => ({
            id: user.id,
            fullName: user.fullName,
        }));

        return {
            message: 'Users retrieved successfully',
            data: filteredUsers,
        };
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        const user = await this.usersService.findById(id);
        const currentUser = req.user;

        if (!user) {
            return {
                message: 'User not found',
                data: null,
            };
        }

        // If user is admin, return full data
        if (currentUser.role === UserRole.ADMIN) {
            const { password, resetPasswordToken, resetPasswordExpires, ...userData } = user;
            return {
                message: 'User retrieved successfully',
                data: userData,
            };
        }

        // For non-admin users, return only id and fullName
        return {
            message: 'User retrieved successfully',
            data: {
                id: user.id,
                fullName: user.fullName,
            },
        };
    }
}
