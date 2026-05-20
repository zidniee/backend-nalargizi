import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import express from 'express';

const server = express();
let isAppInitialized = false;
let app: any;

async function bootstrap() {
  if (!isAppInitialized) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    // Global API prefix
    app.setGlobalPrefix('api/v1');

    // Enable CORS for Flutter mobile app
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global validation pipe with whitelist and transform
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    // Global response transformer
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    isAppInitialized = true;
  }
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
