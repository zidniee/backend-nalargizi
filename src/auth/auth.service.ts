import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  OAuthDto,
} from './dto/auth.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.phoneNumber ? [{ phoneNumber: dto.phoneNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email ?? '',
      user.role,
    );

    return { user, tokens };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email ?? '',
      user.role,
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
      },
      tokens,
    };
  }

  async oauthLogin(
    dto: OAuthDto,
  ): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
    if (dto.provider !== 'google') {
      throw new BadRequestException('Unsupported social login provider');
    }

    try {
      const client = new OAuth2Client();
      const clientIds = [
        this.configService.get<string>('GOOGLE_CLIENT_ID_WEB'),
        this.configService.get<string>('GOOGLE_CLIENT_ID_ANDROID'),
        this.configService.get<string>('GOOGLE_CLIENT_ID_IOS'),
      ].filter(Boolean) as string[];

      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientIds,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException(
          'Google token payload is missing email',
        );
      }

      const email = payload.email.toLowerCase();
      const fullName = payload.name || email.split('@')[0];
      const isEmailVerified = payload.email_verified === true;

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Register user automatically
        user = await this.prisma.user.create({
          data: {
            fullName,
            email,
            emailVerifiedAt: isEmailVerified ? new Date() : null,
            status: 'active',
            role: 'user',
          },
        });
      } else {
        // Update user login details
        const updateData: Prisma.UserUpdateInput = { lastLoginAt: new Date() };
        if (isEmailVerified && !user.emailVerifiedAt) {
          updateData.emailVerifiedAt = new Date();
        }
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      const tokens = await this.generateTokens(
        user.id,
        user.email ?? '',
        user.role,
      );

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          status: user.status,
        },
        tokens,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException(
        `Google login failed: ${error instanceof Error ? error.message : 'Invalid token'}`,
      );
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verify refresh token exists in database (rotation check)
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: dto.refreshToken },
      });

      if (
        !storedToken ||
        storedToken.userId !== payload.sub ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException(
          'Invalid, expired, or revoked refresh token',
        );
      }

      // Rotate: delete old token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private parseExpiry(expiry: string | number): Date {
    const date = new Date();
    if (typeof expiry === 'number') {
      date.setSeconds(date.getSeconds() + expiry);
      return date;
    }
    const amount = parseInt(expiry, 10);
    const unit = expiry
      .replace(/^[0-9]+/, '')
      .trim()
      .toLowerCase();
    switch (unit) {
      case 'd':
      case 'day':
      case 'days':
        date.setDate(date.getDate() + amount);
        break;
      case 'h':
      case 'hour':
      case 'hours':
        date.setHours(date.getHours() + amount);
        break;
      case 'm':
      case 'minute':
      case 'minutes':
        date.setMinutes(date.getMinutes() + amount);
        break;
      case 's':
      case 'second':
      case 'seconds':
        date.setSeconds(date.getSeconds() + amount);
        break;
      default:
        if (!isNaN(Number(expiry))) {
          date.setSeconds(date.getSeconds() + Number(expiry));
        } else {
          date.setDate(date.getDate() + 7);
        }
    }
    return date;
  }

  private async generateTokens(
    sub: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload = { sub, email, role };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') ?? '15m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    const expiresAt = this.parseExpiry(refreshExpiresIn);

    // Clean up expired tokens for this user to keep table small
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: sub,
        expiresAt: { lt: new Date() },
      },
    });

    // Store new refresh token for rotation tracking in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: sub,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
