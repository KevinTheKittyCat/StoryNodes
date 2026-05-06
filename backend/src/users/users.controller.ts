import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PublicUser } from '@shared/prisma';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post("signup")
    async signup(@Body() userData: Partial<User>): Promise<User> {
        return this.usersService.signup(userData);
    }

    @Get("me/:username")
    async getMe(@Param('username') username: string): Promise<PublicUser> {
        return this.usersService.getMe({ username });
    }
}
