
import { encryptPassword } from '@/client/encrypt';
import { Body, Get, HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { UserModel } from '@shared/common';
import { PublicUser } from '@shared/prisma';
import { prisma } from '../prisma';


// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
    @Get(':id')
    async getUser(@Param('id') id: string): Promise<User | null> {
        const userId = parseInt(id, 10);

        // Validate that the ID is a valid number
        if (isNaN(userId)) {
            throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
        }

        try {
            // Find the user by ID using Prisma
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            // Handle Prisma errors
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getAllUsers(): Promise<User[]> {
        try {
            return await prisma.user.findMany({
                orderBy: {
                    id: 'asc'
                }
            });
        } catch (error) {
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(username: string): Promise<User | undefined> {
        return await prisma.user.findUnique({
            where: {
                username: username
            }
        });
    }

    async signup(@Body() { email, username, password, name }: Partial<User>): Promise<User> {
        const hashedPassword = await encryptPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                name
            }
        });

        return user;
    }

    async getMe(@Body() { username }: Partial<User>): Promise<PublicUser> {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username
                },
            }) as User;
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            const publicUser = new UserModel(user).toPublic();
            return publicUser;
        } catch (error) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }
}
