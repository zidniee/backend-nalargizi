import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreatePosyanduScheduleDto,
  CreateImmunizationRecordDto,
} from './dto/posyandu.dto';

@Injectable()
export class PosyanduService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(childId: string) {
    const [immunizationRecords, upcomingSchedules, completedSchedules] =
      await Promise.all([
        this.prisma.immunizationRecord.findMany({
          where: { childId, deletedAt: null },
          include: { definition: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.posyanduSchedule.findMany({
          where: { childId, isCompleted: false, deletedAt: null },
          orderBy: { scheduledAt: 'asc' },
        }),
        this.prisma.posyanduSchedule.findMany({
          where: { childId, isCompleted: true, deletedAt: null },
          orderBy: { scheduledAt: 'desc' },
        }),
      ]);

    return {
      immunizationStatus: immunizationRecords.map((rec) => ({
        id: rec.id,
        vaccineName: rec.definition.name,
        code: rec.definition.code,
        status: rec.status,
        givenAt: rec.givenAt,
        facilityName: rec.facilityName,
      })),
      upcomingSchedules,
      completedSchedules,
    };
  }

  async createSchedule(
    childId: string,
    userId: string,
    dto: CreatePosyanduScheduleDto,
  ) {
    return this.prisma.posyanduSchedule.create({
      data: {
        id: dto.id,
        childId,
        title: dto.title,
        category: dto.category,
        location: dto.location,
        scheduledAt: new Date(dto.scheduledAt),
        note: dto.note,
        createdByUserId: userId,
        clientCreatedAt: dto.clientCreatedAt
          ? new Date(dto.clientCreatedAt)
          : new Date(),
        lastModifiedAt: dto.lastModifiedAt
          ? new Date(dto.lastModifiedAt)
          : new Date(),
      },
    });
  }

  async completeSchedule(id: string, completedAt?: string) {
    const schedule = await this.prisma.posyanduSchedule.findFirst({
      where: { id, deletedAt: null },
    });

    if (!schedule) {
      throw new NotFoundException('Posyandu schedule not found');
    }

    return this.prisma.posyanduSchedule.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        lastModifiedAt: new Date(),
      },
    });
  }

  async getImmunizationRecords(childId: string) {
    return this.prisma.immunizationRecord.findMany({
      where: { childId, deletedAt: null },
      include: { definition: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createImmunizationRecord(
    childId: string,
    dto: CreateImmunizationRecordDto,
  ) {
    return this.prisma.immunizationRecord.create({
      data: {
        id: dto.id,
        childId,
        immunizationDefinitionId: dto.immunizationDefinitionId,
        givenAt: dto.givenAt ? new Date(dto.givenAt) : null,
        status: dto.status ?? 'pending',
        facilityName: dto.facilityName,
        batchNumber: dto.batchNumber,
        note: dto.note,
        clientCreatedAt: dto.clientCreatedAt
          ? new Date(dto.clientCreatedAt)
          : new Date(),
        lastModifiedAt: dto.lastModifiedAt
          ? new Date(dto.lastModifiedAt)
          : new Date(),
      },
    });
  }
}
