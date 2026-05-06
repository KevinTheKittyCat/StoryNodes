
import { comparePasswords, encryptPassword } from '@/client/encrypt';
import { logger } from '@/logging/winston';
import { prisma } from '@/prisma';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class TokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async onModuleInit() {
        const isThereAnyUser = await prisma.user.findFirst();
        logger.info('Checking for existing users in the database...');
        if (!isThereAnyUser) {
            logger.warn('No users found in database.\n Creating default user with username "admin@test.com" and password "admin123".');
            await prisma.user.create({
                data: {
                    username: 'admin@test.com',
                    password: await encryptPassword('admin123'), // Hash the default password
                    authType: "LOCAL",
                },
            });
        }
    }

    async signIn(
        username: string,
        password: string,
    ): Promise<TokenDto> {
        try {
            // Find the user by username and password using Prisma
            const user = await prisma.user.findFirst({
                // TODO: Also check emails
                where: {
                    username: username,
                    authType: "LOCAL",
                }
            });
            if (!user || !user?.password || await comparePasswords(password, user.password) === false) {
                const info = { user, passwordMatch: await comparePasswords(password, user?.password ?? '') };
                console.error('Failed login attempt:', { username, ...info });
                throw new UnauthorizedException('Invalid username or password');
            }
            // Successful login - generate JWT token or session
            const payload = { sub: user.id, username: user.username };
            return {
                access_token: await this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>('JWT_SECRET'),
                }),
            };
        } catch (error) {
            console.error('Error during sign-in:', error);
            if (error instanceof HttpException) throw error;
            throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async signAccessToken(data: any): Promise<TokenDto> {
        const payload = { ...data };
        return ({
            access_token: await this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
            }),
        });
    }
}
