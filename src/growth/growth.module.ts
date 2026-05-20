import { Module } from '@nestjs/common';
import { GrowthController } from './growth.controller';
import { GrowthService } from './growth.service';
import { ZScoreService } from './zscore.service';

@Module({
  controllers: [GrowthController],
  providers: [GrowthService, ZScoreService],
  exports: [GrowthService, ZScoreService],
})
export class GrowthModule {}
