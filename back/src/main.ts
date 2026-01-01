import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');
    
    logger.log('Starting application...');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    logger.log(`PORT: ${process.env.PORT || '3000'}`);
    
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.setGlobalPrefix('api');

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  } catch (error) {
    const logger = new Logger('Bootstrap');
    logger.error('Failed to start application', error);
    if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

bootstrap();
