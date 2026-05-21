import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Gender } from '@prisma/client';
import { Trim, SanitizeHtml } from '../../common/decorators/sanitize.decorator';

export class CreateChildDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  fullName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  bloodType?: string;

  @IsOptional()
  @IsString()
  @Trim()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  notes?: string;
}

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  fullName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  bloodType?: string;

  @IsOptional()
  @IsString()
  @Trim()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  notes?: string;
}
