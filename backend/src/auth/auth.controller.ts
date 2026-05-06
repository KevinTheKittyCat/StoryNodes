
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiProperty, ApiQuery, ApiSchema } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService, TokenDto } from './auth.service';

@ApiSchema({ description: 'Login schema' })
class Login {
    @ApiProperty({
        default: 'Henry'
    })
    username: string;

    @ApiProperty({
        default: 'password'
    })
    password: string;

    /*
    @ApiProperty({
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'Error'
            },
            status: {
                type: 'number',
                example: 400
            }
        },
        required: ['name', 'status']
    })
    rawDefinition: Record<string, any>;
    */
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @ApiQuery({ name: 'username', required: true, example: 'Henry', type: 'string' })
    @ApiQuery({ name: 'password', required: true, example: 'password', type: 'string' })
    //@ApiQuery({ schema: getSchemaPath(Login) })
    @ApiBody({ type: Login })
    @ApiOkResponse({ description: 'User signed in successfully', type: TokenDto })
    @Post('login')
    signIn(@Body() login: Login): Promise<TokenDto> {
        return this.authService.signIn(login.username, login.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
