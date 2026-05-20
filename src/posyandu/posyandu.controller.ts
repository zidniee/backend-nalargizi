import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PosyanduService } from './posyandu.service';
import {
  CreatePosyanduScheduleDto,
  CompleteScheduleDto,
  CreateImmunizationRecordDto,
} from './dto/posyandu.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class PosyanduController {
  constructor(private readonly posyanduService: PosyanduService) {}

  @Get('posyandu/overview')
  async getOverview(@Query('childId') childId: string) {
    return this.posyanduService.getOverview(childId);
  }

  @Post('children/:childId/posyandu-schedules')
  async createSchedule(
    @Param('childId') childId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePosyanduScheduleDto,
  ) {
    return this.posyanduService.createSchedule(childId, req.user.id, dto);
  }

  @Patch('posyandu-schedules/:id/complete')
  async completeSchedule(
    @Param('id') id: string,
    @Body() dto: CompleteScheduleDto,
  ) {
    return this.posyanduService.completeSchedule(id, dto.completedAt);
  }

  @Get('children/:childId/immunization-records')
  async getImmunizationRecords(@Param('childId') childId: string) {
    return this.posyanduService.getImmunizationRecords(childId);
  }

  @Post('children/:childId/immunization-records')
  async createImmunizationRecord(
    @Param('childId') childId: string,
    @Body() dto: CreateImmunizationRecordDto,
  ) {
    return this.posyanduService.createImmunizationRecord(childId, dto);
  }
}
