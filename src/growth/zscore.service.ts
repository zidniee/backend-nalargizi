import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Gender, Prisma } from '@prisma/client';

interface ZScoreResult {
  zScoreWeight: number | null;
  zScoreHeight: number | null;
  zScoreBmi: number | null;
}

@Injectable()
export class ZScoreService {
  private readonly logger = new Logger(ZScoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateZScores(
    gender: Gender,
    dateOfBirth: Date,
    measuredAt: Date,
    weightKg: number,
    heightCm: number,
  ): Promise<ZScoreResult> {
    const ageMonths = this.calculateAgeInMonths(dateOfBirth, measuredAt);

    if (ageMonths < 0 || ageMonths > 60) {
      this.logger.warn(
        `Age ${ageMonths} months is outside WHO standard range (0-60). Skipping Z-score calculation.`,
      );
      return { zScoreWeight: null, zScoreHeight: null, zScoreBmi: null };
    }

    const [weightStandard, heightStandard, bmiStandard] = await Promise.all([
      this.getStandard(gender, 'weight', ageMonths),
      this.getStandard(gender, 'height', ageMonths),
      this.getStandard(gender, 'bmi', ageMonths),
    ]);

    const zScoreWeight = weightStandard
      ? this.computeZScore(weightKg, weightStandard)
      : null;

    const zScoreHeight = heightStandard
      ? this.computeZScore(heightCm, heightStandard)
      : null;

    let zScoreBmi: number | null = null;
    if (bmiStandard && heightCm > 0) {
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      zScoreBmi = this.computeZScore(bmi, bmiStandard);
    }

    return { zScoreWeight, zScoreHeight, zScoreBmi };
  }

  private calculateAgeInMonths(dateOfBirth: Date, measuredAt: Date): number {
    const years = measuredAt.getFullYear() - dateOfBirth.getFullYear();
    const months = measuredAt.getMonth() - dateOfBirth.getMonth();
    const days = measuredAt.getDate() - dateOfBirth.getDate();

    let totalMonths = years * 12 + months;
    if (days < 0) {
      totalMonths--;
    }
    return Math.max(0, totalMonths);
  }

  private async getStandard(gender: Gender, metric: string, ageMonths: number) {
    return this.prisma.whoGrowthStandard.findUnique({
      where: {
        gender_metric_ageMonths: { gender, metric, ageMonths },
      },
    });
  }

  private computeZScore(
    value: number,
    standard: {
      median: Prisma.Decimal;
      sd1: Prisma.Decimal;
      sd1neg: Prisma.Decimal;
      sd2: Prisma.Decimal;
      sd2neg: Prisma.Decimal;
      sd3: Prisma.Decimal;
      sd3neg: Prisma.Decimal;
    },
  ): number {
    const median = Number(standard.median);
    const sd1 = Number(standard.sd1);
    const sd1neg = Number(standard.sd1neg);

    if (value >= median) {
      const sdUpper = sd1 - median;
      if (sdUpper === 0) return 0;
      const z = (value - median) / sdUpper;
      return Math.round(z * 100) / 100;
    } else {
      const sdLower = median - sd1neg;
      if (sdLower === 0) return 0;
      const z = (value - median) / sdLower;
      return Math.round(z * 100) / 100;
    }
  }
}
