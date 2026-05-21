import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import helmet from 'helmet';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  // 1. Secure HTTP headers with helmet
  app.use(helmet());

  // 2. Setup global API prefix
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  // 3. Configure CORS with dynamic origin whitelisting
  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS');
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  let corsOrigin: boolean | string[] = true;

  if (nodeEnv === 'production') {
    if (corsOriginsRaw) {
      const origins = corsOriginsRaw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      corsOrigin = origins.length > 0 ? origins : false;
    } else {
      // Restrictive default for production to protect endpoint
      corsOrigin = false;
    }
  } else {
    corsOrigin = true;
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // 4. Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 5. Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // 6. Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
}
