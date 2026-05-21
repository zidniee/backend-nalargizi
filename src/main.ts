import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupApp } from './common/utils/setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');

  if (nodeEnv === 'production') {
    if (!jwtSecret || jwtSecret === 'change-me-in-production') {
      throw new Error('FATAL: JWT_SECRET is unsafe for production deployment.');
    }
    if (!jwtRefreshSecret || jwtRefreshSecret === 'change-me-in-production') {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET is unsafe for production deployment.',
      );
    }
  }

  // Set up unified configurations
  setupApp(app);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(
    `🚀 NalarGizi API is running on: http://localhost:${port}/api/v1`,
  );
}

void bootstrap();
