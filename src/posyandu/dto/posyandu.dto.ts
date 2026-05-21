import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ImmunizationStatus } from '@prisma/client';
import { Trim, SanitizeHtml } from '../../common/decorators/sanitize.decorator';

export class CreatePosyanduScheduleDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  title!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  category!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  location!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
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
  @Trim()
  @SanitizeHtml()
  facilityName?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  note?: string;

  @IsOptional()
  @IsDateString()
  clientCreatedAt?: string;

  @IsOptional()
  @IsDateString()
  lastModifiedAt?: string;
}
