import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  SyncRequestDto,
  SyncOperationDto,
  SyncAction,
  SyncEntityType,
  SyncResultItem,
} from './dto/sync.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processSync(
    dto: SyncRequestDto,
    userId: string,
  ): Promise<{
    syncTime: string;
    results: SyncResultItem[];
    hasConflicts: boolean;
  }> {
    const results: SyncResultItem[] = [];

    await this.prisma.$transaction(
      async (tx) => {
        for (const operation of dto.operations) {
          try {
            const result = await this.processOperation(tx, operation, userId);
            results.push(result);
          } catch (error) {
            this.logger.error(
              `Sync error for ${operation.clientUniqueId}: ${error instanceof Error ? error.message : 'Unknown'}`,
            );
            results.push({
              clientUniqueId: operation.clientUniqueId,
              status: 'error',
              errorMessage:
                error instanceof Error
                  ? error.message
                  : 'Unknown processing error',
            });
          }
        }
      },
      { timeout: 30000 },
    );

    const hasConflicts = results.some((r) => r.status === 'conflict');

    return {
      syncTime: new Date().toISOString(),
      results,
      hasConflicts,
    };
  }

  private async processOperation(
    tx: Prisma.TransactionClient,
    op: SyncOperationDto,
    userId: string,
  ): Promise<SyncResultItem> {
    switch (op.action) {
      case SyncAction.create:
        return this.handleCreate(tx, op, userId);
      case SyncAction.update:
        return this.handleUpdate(tx, op);
      case SyncAction.delete:
        return this.handleDelete(tx, op);
    }
  }

  private async handleCreate(
    tx: Prisma.TransactionClient,
    op: SyncOperationDto,
    userId: string,
  ): Promise<SyncResultItem> {
    const id = op.clientUniqueId;
    const data = op.data;

    switch (op.type) {
      case SyncEntityType.growth: {
        const existing = await tx.growthRecord.findUnique({ where: { id } });
        if (existing) {
          // Idempotent: already exists (retry scenario), update instead
          await tx.growthRecord.update({
            where: { id },
            data: {
              weightKg: data.weightKg as number,
              heightCm: data.heightCm as number,
              headCircumferenceCm: data.headCircumferenceCm as
                | number
                | undefined,
              notes: data.notes as string | undefined,
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        } else {
          await tx.growthRecord.create({
            data: {
              id,
              childId: data.childId as string,
              measuredAt: new Date(data.measuredAt as string),
              weightKg: data.weightKg as number,
              heightCm: data.heightCm as number,
              headCircumferenceCm: data.headCircumferenceCm as
                | number
                | undefined,
              recordedByUserId: userId,
              notes: data.notes as string | undefined,
              clientCreatedAt: data.clientCreatedAt
                ? new Date(data.clientCreatedAt as string)
                : new Date(),
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        }
        return { clientUniqueId: id, status: 'synced' };
      }

      case SyncEntityType.meal: {
        const existing = await tx.nutritionMeal.findUnique({ where: { id } });
        if (!existing) {
          await tx.nutritionMeal.create({
            data: {
              id,
              nutritionJournalId: data.nutritionJournalId as string,
              mealType: data.mealType as
                | 'breakfast'
                | 'lunch'
                | 'dinner'
                | 'snack',
              title: data.title as string,
              subtitle: data.subtitle as string | undefined,
              calories: data.calories as number | undefined,
              portion: data.portion as string | undefined,
              statusLabel: data.statusLabel as string | undefined,
              statusColor: data.statusColor as string | undefined,
              isAiGenerated: (data.isAiGenerated as boolean) ?? false,
              aiConfidence: data.aiConfidence as number | undefined,
              rawInput: data.rawInput as string | undefined,
              clientCreatedAt: data.clientCreatedAt
                ? new Date(data.clientCreatedAt as string)
                : new Date(),
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        }
        return { clientUniqueId: id, status: 'synced' };
      }

      case SyncEntityType.hydration: {
        const existing = await tx.hydrationLog.findUnique({ where: { id } });
        if (!existing) {
          await tx.hydrationLog.create({
            data: {
              id,
              childId: data.childId as string,
              logDate: new Date(data.logDate as string),
              cupsTarget: data.cupsTarget as number,
              cupsConsumed: data.cupsConsumed as number,
              unit: (data.unit as string) ?? 'cups',
              notes: data.notes as string | undefined,
              clientCreatedAt: data.clientCreatedAt
                ? new Date(data.clientCreatedAt as string)
                : new Date(),
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        }
        return { clientUniqueId: id, status: 'synced' };
      }

      case SyncEntityType.posyandu_schedule: {
        const existing = await tx.posyanduSchedule.findUnique({
          where: { id },
        });
        if (!existing) {
          await tx.posyanduSchedule.create({
            data: {
              id,
              childId: data.childId as string,
              title: data.title as string,
              category: data.category as string,
              location: data.location as string,
              scheduledAt: new Date(data.scheduledAt as string),
              note: data.note as string | undefined,
              createdByUserId: userId,
              clientCreatedAt: data.clientCreatedAt
                ? new Date(data.clientCreatedAt as string)
                : new Date(),
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        }
        return { clientUniqueId: id, status: 'synced' };
      }

      case SyncEntityType.immunization: {
        const existing = await tx.immunizationRecord.findUnique({
          where: { id },
        });
        if (!existing) {
          await tx.immunizationRecord.create({
            data: {
              id,
              childId: data.childId as string,
              immunizationDefinitionId: data.immunizationDefinitionId as string,
              givenAt: data.givenAt ? new Date(data.givenAt as string) : null,
              status:
                (data.status as 'done' | 'pending' | 'skipped') ?? 'pending',
              facilityName: data.facilityName as string | undefined,
              batchNumber: data.batchNumber as string | undefined,
              note: data.note as string | undefined,
              clientCreatedAt: data.clientCreatedAt
                ? new Date(data.clientCreatedAt as string)
                : new Date(),
              lastModifiedAt: data.lastModifiedAt
                ? new Date(data.lastModifiedAt as string)
                : new Date(),
            },
          });
        }
        return { clientUniqueId: id, status: 'synced' };
      }

      default:
        return { clientUniqueId: id, status: 'synced' };
    }
  }

  private async handleUpdate(
    tx: Prisma.TransactionClient,
    op: SyncOperationDto,
  ): Promise<SyncResultItem> {
    const id = op.clientUniqueId;
    const data = op.data;
    const clientLastModified = data.lastModifiedAt
      ? new Date(data.lastModifiedAt as string)
      : new Date();

    // Generic conflict detection based on entity type
    const modelMap: Record<
      string,
      {
        findFn: () => Promise<{ lastModifiedAt: Date } | null>;
        updateFn: () => Promise<void>;
      }
    > = {
      [SyncEntityType.growth]: {
        findFn: () =>
          tx.growthRecord.findUnique({
            where: { id },
            select: { lastModifiedAt: true },
          }),
        updateFn: async () => {
          await tx.growthRecord.update({
            where: { id },
            data: {
              weightKg: data.weightKg as number | undefined,
              heightCm: data.heightCm as number | undefined,
              headCircumferenceCm: data.headCircumferenceCm as
                | number
                | undefined,
              notes: data.notes as string | undefined,
              lastModifiedAt: clientLastModified,
            },
          });
        },
      },
      [SyncEntityType.posyandu_schedule]: {
        findFn: () =>
          tx.posyanduSchedule.findUnique({
            where: { id },
            select: { lastModifiedAt: true },
          }),
        updateFn: async () => {
          await tx.posyanduSchedule.update({
            where: { id },
            data: {
              isCompleted: data.isCompleted as boolean | undefined,
              completedAt: data.completedAt
                ? new Date(data.completedAt as string)
                : undefined,
              lastModifiedAt: clientLastModified,
            },
          });
        },
      },
      [SyncEntityType.hydration]: {
        findFn: () =>
          tx.hydrationLog.findUnique({
            where: { id },
            select: { lastModifiedAt: true },
          }),
        updateFn: async () => {
          await tx.hydrationLog.update({
            where: { id },
            data: {
              cupsConsumed: data.cupsConsumed as number | undefined,
              cupsTarget: data.cupsTarget as number | undefined,
              notes: data.notes as string | undefined,
              lastModifiedAt: clientLastModified,
            },
          });
        },
      },
      [SyncEntityType.meal]: {
        findFn: () =>
          tx.nutritionMeal.findUnique({
            where: { id },
            select: { lastModifiedAt: true },
          }),
        updateFn: async () => {
          await tx.nutritionMeal.update({
            where: { id },
            data: {
              title: data.title as string | undefined,
              subtitle: data.subtitle as string | undefined,
              calories: data.calories as number | undefined,
              portion: data.portion as string | undefined,
              statusLabel: data.statusLabel as string | undefined,
              statusColor: data.statusColor as string | undefined,
              lastModifiedAt: clientLastModified,
            },
          });
        },
      },
    };

    const handler = modelMap[op.type];
    if (!handler) {
      return { clientUniqueId: id, status: 'synced' };
    }

    const existing = await handler.findFn();
    if (!existing) {
      return {
        clientUniqueId: id,
        status: 'error',
        errorMessage: 'Record not found for update',
      };
    }

    // Conflict detection: server is newer → reject
    if (existing.lastModifiedAt >= clientLastModified) {
      return {
        clientUniqueId: id,
        status: 'conflict',
        serverData: existing as unknown as Record<string, unknown>,
      };
    }

    await handler.updateFn();
    return { clientUniqueId: id, status: 'synced' };
  }

  private async handleDelete(
    tx: Prisma.TransactionClient,
    op: SyncOperationDto,
  ): Promise<SyncResultItem> {
    const id = op.clientUniqueId;
    const now = new Date();

    switch (op.type) {
      case SyncEntityType.growth:
        await tx.growthRecord.update({
          where: { id },
          data: { deletedAt: now },
        });
        break;
      case SyncEntityType.meal:
        await tx.nutritionMeal.update({
          where: { id },
          data: { deletedAt: now },
        });
        break;
      case SyncEntityType.hydration:
        await tx.hydrationLog.update({
          where: { id },
          data: { deletedAt: now },
        });
        break;
      case SyncEntityType.posyandu_schedule:
        await tx.posyanduSchedule.update({
          where: { id },
          data: { deletedAt: now },
        });
        break;
      case SyncEntityType.immunization:
        await tx.immunizationRecord.update({
          where: { id },
          data: { deletedAt: now },
        });
        break;
    }

    return { clientUniqueId: id, status: 'deleted' };
  }
}
