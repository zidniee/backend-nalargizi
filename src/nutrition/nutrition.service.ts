import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateNutritionJournalDto,
  CreateMealDto,
  UpdateMealDto,
  CreateHydrationLogDto,
} from './dto/nutrition.dto';
import { GeminiService, NutritionAnalysisResult } from '../ai/gemini.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  // ─── Nutrition Journals ────────────────────────────────────────

  async findJournalsByChild(childId: string) {
    return this.prisma.nutritionJournal.findMany({
      where: { childId, deletedAt: null },
      include: { meals: { where: { deletedAt: null } } },
      orderBy: { journalDate: 'desc' },
    });
  }

  async createJournal(childId: string, dto: CreateNutritionJournalDto) {
    return this.prisma.nutritionJournal.create({
      data: {
        id: dto.id,
        childId,
        journalDate: new Date(dto.journalDate),
        totalCalories: dto.totalCalories,
        totalProteinG: dto.totalProteinG,
        totalCarbG: dto.totalCarbG,
        totalFatG: dto.totalFatG,
        totalWaterMl: dto.totalWaterMl,
        notes: dto.notes,
        clientCreatedAt: dto.clientCreatedAt
          ? new Date(dto.clientCreatedAt)
          : new Date(),
        lastModifiedAt: dto.lastModifiedAt
          ? new Date(dto.lastModifiedAt)
          : new Date(),
      },
    });
  }

  // ─── Nutrition Meals ───────────────────────────────────────────

  async createMeal(journalId: string, dto: CreateMealDto) {
    const journal = await this.prisma.nutritionJournal.findFirst({
      where: { id: journalId, deletedAt: null },
    });

    if (!journal) {
      throw new NotFoundException('Nutrition journal not found');
    }

    return this.prisma.nutritionMeal.create({
      data: {
        id: dto.id,
        nutritionJournalId: journalId,
        mealType: dto.mealType,
        title: dto.title,
        subtitle: dto.subtitle,
        calories: dto.calories,
        portion: dto.portion,
        statusLabel: dto.statusLabel,
        statusColor: dto.statusColor,
        consumedAt: dto.consumedAt ? new Date(dto.consumedAt) : null,
        clientCreatedAt: dto.clientCreatedAt
          ? new Date(dto.clientCreatedAt)
          : new Date(),
        lastModifiedAt: dto.lastModifiedAt
          ? new Date(dto.lastModifiedAt)
          : new Date(),
      },
    });
  }

  async updateMeal(mealId: string, dto: UpdateMealDto) {
    const meal = await this.prisma.nutritionMeal.findFirst({
      where: { id: mealId, deletedAt: null },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return this.prisma.nutritionMeal.update({
      where: { id: mealId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.calories !== undefined && { calories: dto.calories }),
        ...(dto.portion !== undefined && { portion: dto.portion }),
        ...(dto.statusLabel !== undefined && { statusLabel: dto.statusLabel }),
        ...(dto.statusColor !== undefined && { statusColor: dto.statusColor }),
        lastModifiedAt: new Date(),
      },
    });
  }

  async softDeleteMeal(mealId: string) {
    const meal = await this.prisma.nutritionMeal.findFirst({
      where: { id: mealId, deletedAt: null },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return this.prisma.nutritionMeal.update({
      where: { id: mealId },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Hydration Logs ────────────────────────────────────────────

  async getHydrationToday(childId: string) {
    const today = new Date();
    const todayUtcStr = today.toISOString().split('T')[0];
    const todayDate = new Date(todayUtcStr);

    return this.prisma.hydrationLog.findFirst({
      where: {
        childId,
        logDate: todayDate,
        deletedAt: null,
      },
    });
  }

  async createHydrationLog(childId: string, dto: CreateHydrationLogDto) {
    return this.prisma.hydrationLog.create({
      data: {
        id: dto.id,
        childId,
        logDate: new Date(dto.logDate),
        cupsTarget: dto.cupsTarget,
        cupsConsumed: dto.cupsConsumed,
        unit: dto.unit ?? 'cups',
        notes: dto.notes,
        clientCreatedAt: dto.clientCreatedAt
          ? new Date(dto.clientCreatedAt)
          : new Date(),
        lastModifiedAt: dto.lastModifiedAt
          ? new Date(dto.lastModifiedAt)
          : new Date(),
      },
    });
  }

  // ─── AI Nutrition Analysis ─────────────────────────────────────

  async analyzeNutrition(text: string): Promise<NutritionAnalysisResult> {
    return this.geminiService.analyzeNutrition(text);
  }
}
