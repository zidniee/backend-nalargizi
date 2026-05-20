import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ZScoreService } from './zscore.service';
import { CreateGrowthRecordDto } from './dto/growth.dto';
import { Gender } from '@prisma/client';

@Injectable()
export class GrowthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zScoreService: ZScoreService,
  ) {}

  async findAllByChild(childId: string) {
    return this.prisma.growthRecord.findMany({
      where: { childId, deletedAt: null },
      orderBy: { measuredAt: 'desc' },
    });
  }

  async create(childId: string, userId: string, dto: CreateGrowthRecordDto) {
    const child = await this.prisma.child.findFirst({
      where: { id: childId, deletedAt: null },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Calculate Z-scores based on WHO standards
    const zScores = await this.zScoreService.calculateZScores(
      child.gender,
      child.dateOfBirth,
      new Date(dto.measuredAt),
      dto.weightKg,
      dto.heightCm,
    );

    return this.prisma.growthRecord.create({
      data: {
        id: dto.id,
        childId,
        measuredAt: new Date(dto.measuredAt),
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        headCircumferenceCm: dto.headCircumferenceCm,
        zScoreWeight: zScores.zScoreWeight,
        zScoreHeight: zScores.zScoreHeight,
        zScoreBmi: zScores.zScoreBmi,
        recordedByUserId: userId,
        source: dto.source ?? 'manual',
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

  async getGrowthStandards(gender: string, metric: string) {
    return this.prisma.whoGrowthStandard.findMany({
      where: { gender: gender as Gender, metric },
      orderBy: { ageMonths: 'asc' },
      select: {
        ageMonths: true,
        sd3neg: true,
        sd2neg: true,
        sd1neg: true,
        median: true,
        sd1: true,
        sd2: true,
        sd3: true,
      },
    });
  }
}
