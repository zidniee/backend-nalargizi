import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SyncAction {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export enum SyncEntityType {
  growth = 'growth',
  nutrition_journal = 'nutrition_journal',
  meal = 'meal',
  hydration = 'hydration',
  posyandu_schedule = 'posyandu_schedule',
  immunization = 'immunization',
}

export class SyncOperationDto {
  @IsEnum(SyncAction)
  action!: SyncAction;

  @IsEnum(SyncEntityType)
  type!: SyncEntityType;

  @IsNotEmpty()
  @IsString()
  clientUniqueId!: string;

  @IsObject()
  data!: Record<string, unknown>;
}

export class SyncRequestDto {
  @IsOptional()
  @IsDateString()
  lastSyncedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}

export interface SyncResultItem {
  clientUniqueId: string;
  status: 'synced' | 'deleted' | 'conflict' | 'error';
  serverData?: Record<string, unknown>;
  errorMessage?: string;
}
