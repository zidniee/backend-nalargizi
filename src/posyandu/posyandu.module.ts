import { Module } from '@nestjs/common';
import { PosyanduController } from './posyandu.controller';
import { PosyanduService } from './posyandu.service';

@Module({
  controllers: [PosyanduController],
  providers: [PosyanduService],
  exports: [PosyanduService],
})
export class PosyanduModule {}
