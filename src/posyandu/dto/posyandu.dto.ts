import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ImmunizationStatus } from '@prisma/client';

export class CreatePosyanduScheduleDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsNotEmpty()
  @IsString()
  location!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}

export class CompleteScheduleDto {
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class CreateImmunizationRecordDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  immunizationDefinitionId!: string;

  @IsOptional()
  @IsDateString()
  givenAt?: string;

  @IsOptional()
  @IsEnum(ImmunizationStatus)
  status?: ImmunizationStatus;

  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}
