import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { MealType } from '@prisma/client';
import { Trim, SanitizeHtml } from '../../common/decorators/sanitize.decorator';

export class CreateNutritionJournalDto {
  @IsUUID()
  id!: string;

  @IsDateString()
  journalDate!: string;

  @IsOptional()
  @IsInt()
  totalCalories?: number;

  @IsOptional()
  @IsNumber()
  totalProteinG?: number;

  @IsOptional()
  @IsNumber()
  totalCarbG?: number;

  @IsOptional()
  @IsNumber()
  totalFatG?: number;

  @IsOptional()
  @IsInt()
  totalWaterMl?: number;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  notes?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}

export class CreateMealDto {
  @IsUUID()
  id!: string;

  @IsEnum(MealType)
  mealType!: MealType;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  title!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  subtitle?: string;

  @IsOptional()
  @IsInt()
  calories?: number;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  portion?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  statusLabel?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  statusColor?: string;

  @IsOptional()
  @IsDateString()
  consumedAt?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}

export class UpdateMealDto {
  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  title?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  subtitle?: string;

  @IsOptional()
  @IsInt()
  calories?: number;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  portion?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  statusLabel?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  statusColor?: string;
}

export class CreateHydrationLogDto {
  @IsUUID()
  id!: string;

  @IsDateString()
  logDate!: string;

  @IsInt()
  cupsTarget!: number;

  @IsInt()
  cupsConsumed!: number;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  unit?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  notes?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}

export class AnalyzeNutritionDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  text!: string;
}
