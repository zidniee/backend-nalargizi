import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
})
export class AppModule {}
