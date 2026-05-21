import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { GrowthSource } from '@prisma/client';
import { Trim, SanitizeHtml } from '../../common/decorators/sanitize.decorator';

export class CreateGrowthRecordDto {
  @IsUUID()
  id!: string;

  @IsDateString()
  measuredAt!: string;

  @IsNumber()
  weightKg!: number;

  @IsNumber()
  heightCm!: number;

  @IsOptional()
  @IsNumber()
  headCircumferenceCm?: number;

  @IsOptional()
  @IsEnum(GrowthSource)
  source?: GrowthSource;

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

export class GrowthStandardsQueryDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  gender!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  metric!: string;
}
