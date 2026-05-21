import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/common/utils/setup-app';
import express from 'express';

const server = express();
let isAppInitialized = false;
let app: INestApplication;


async function bootstrap() {
  if (!isAppInitialized) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');

    if (nodeEnv === 'production') {
      if (!jwtSecret || jwtSecret === 'change-me-in-production') {
        throw new Error('FATAL: JWT_SECRET is unsafe for production deployment.');
      }
      if (!jwtRefreshSecret || jwtRefreshSecret === 'change-me-in-production') {
        throw new Error('FATAL: JWT_REFRESH_SECRET is unsafe for production deployment.');
      }
    }

    // Set up unified configurations
    setupApp(app);

    await app.init();
    isAppInitialized = true;
  }
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

