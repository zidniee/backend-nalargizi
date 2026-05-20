import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncRequestDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(
    @Body() dto: SyncRequestDto,
    @Request() req: { user: { id: string } },
  ) {
    const result = await this.syncService.processSync(dto, req.user.id);

    return {
      success: !result.hasConflicts,
      message: result.hasConflicts
        ? 'Sync completed with conflicts'
        : 'Sync completed successfully',
      data: result,
    };
  }
}
