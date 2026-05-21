import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim, SanitizeHtml } from '../../common/decorators/sanitize.decorator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  fullName!: string;

  @IsEmail()
  @Trim()
  @SanitizeHtml()
  email!: string;

  @IsOptional()
  @IsString()
  @Trim()
  @SanitizeHtml()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  @Trim()
  @SanitizeHtml()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  refreshToken!: string;
}

export class OAuthDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  provider!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHtml()
  idToken!: string;
}
