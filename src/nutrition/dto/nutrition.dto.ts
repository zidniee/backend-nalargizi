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
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsInt()
  calories?: number;

  @IsOptional()
  @IsString()
  portion?: string;

  @IsOptional()
  @IsString()
  statusLabel?: string;

  @IsOptional()
  @IsString()
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
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsInt()
  calories?: number;

  @IsOptional()
  @IsString()
  portion?: string;

  @IsOptional()
  @IsString()
  statusLabel?: string;

  @IsOptional()
  @IsString()
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
  unit?: string;

  @IsOptional()
  @IsString()
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
  text!: string;
}
