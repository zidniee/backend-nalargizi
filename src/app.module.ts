import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { GrowthModule } from './growth/growth.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { PosyanduModule } from './posyandu/posyandu.module';
import { SyncModule } from './sync/sync.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // limit each IP to 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    ChildrenModule,
    GrowthModule,
    NutritionModule,
    PosyanduModule,
    SyncModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
