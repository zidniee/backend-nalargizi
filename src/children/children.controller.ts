import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto, UpdateChildDto } from './dto/children.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.childrenService.findAllByUser(req.user.id);
  }

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateChildDto,
  ) {
    return this.childrenService.create(req.user.id, dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.childrenService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateChildDto,
  ) {
    return this.childrenService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.childrenService.softDelete(id, req.user.id);
  }
}
