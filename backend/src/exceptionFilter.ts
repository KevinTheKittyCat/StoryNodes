import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { logger } from './logging/winston';

@Catch() // Handles all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const err = exception instanceof Error
            ? exception
            : new Error(typeof exception === 'string' ? exception : (exception as any)?.message ?? String(exception));
        logger.error(err, { url: request?.url, method: request?.method });

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const message = exception.getResponse();
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message,
            });
        } else {
            response.status(500).json({
                statusCode: 500,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: 'Internal server error',
            });
        }
    }
}