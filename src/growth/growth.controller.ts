import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GrowthService } from './growth.service';
import {
  CreateGrowthRecordDto,
  GrowthStandardsQueryDto,
} from './dto/growth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Get('children/:childId/growth-records')
  async findAll(@Param('childId') childId: string) {
    return this.growthService.findAllByChild(childId);
  }

  @Post('children/:childId/growth-records')
  async create(
    @Param('childId') childId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateGrowthRecordDto,
  ) {
    return this.growthService.create(childId, req.user.id, dto);
  }

  @Get('growth-standards')
  async getStandards(@Query() query: GrowthStandardsQueryDto) {
    return this.growthService.getGrowthStandards(query.gender, query.metric);
  }
}
