import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Enable environment variables
import * as dotenv from 'dotenv';

import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { AllExceptionsFilter } from './exceptionFilter';
import { customLevelLogger } from './logging/winston';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: customLevelLogger })
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS for frontend access
  app.enableCors({
    origin: process.env.BACKEND_CORS_ORIGINS?.split(",") ?? [], // https://localhost:3000
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.use(cookieParser(process.env.JWT_SECRET));

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.BACKEND_PORT ?? 8000);
}
bootstrap();


