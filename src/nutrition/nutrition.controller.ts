import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import {
  CreateNutritionJournalDto,
  CreateMealDto,
  UpdateMealDto,
  CreateHydrationLogDto,
  AnalyzeNutritionDto,
} from './dto/nutrition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  // ─── Nutrition Journals ────────────────────────────────────────

  @Get('children/:childId/nutrition-journals')
  async findJournals(@Param('childId') childId: string) {
    return this.nutritionService.findJournalsByChild(childId);
  }

  @Post('children/:childId/nutrition-journals')
  async createJournal(
    @Param('childId') childId: string,
    @Body() dto: CreateNutritionJournalDto,
  ) {
    return this.nutritionService.createJournal(childId, dto);
  }

  // ─── Nutrition Meals ───────────────────────────────────────────

  @Post('nutrition-journals/:journalId/meals')
  async createMeal(
    @Param('journalId') journalId: string,
    @Body() dto: CreateMealDto,
  ) {
    return this.nutritionService.createMeal(journalId, dto);
  }

  @Patch('nutrition-meals/:mealId')
  async updateMeal(
    @Param('mealId') mealId: string,
    @Body() dto: UpdateMealDto,
  ) {
    return this.nutritionService.updateMeal(mealId, dto);
  }

  @Delete('nutrition-meals/:mealId')
  async deleteMeal(@Param('mealId') mealId: string) {
    return this.nutritionService.softDeleteMeal(mealId);
  }

  // ─── Hydration Logs ────────────────────────────────────────────

  @Get('children/:childId/hydration-logs/today')
  async getHydrationToday(@Param('childId') childId: string) {
    return this.nutritionService.getHydrationToday(childId);
  }

  @Post('children/:childId/hydration-logs')
  async createHydrationLog(
    @Param('childId') childId: string,
    @Body() dto: CreateHydrationLogDto,
  ) {
    return this.nutritionService.createHydrationLog(childId, dto);
  }

  // ─── AI Nutrition Analysis ─────────────────────────────────────

  @Post('nutrition/analyze')
  async analyzeNutrition(@Body() dto: AnalyzeNutritionDto) {
    return this.nutritionService.analyzeNutrition(dto.text);
  }
}
