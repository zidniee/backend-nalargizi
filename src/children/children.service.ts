import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateChildDto, UpdateChildDto } from './dto/children.dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.child.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const child = await this.prisma.child.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  async create(userId: string, dto: CreateChildDto) {
    return this.prisma.child.create({
      data: {
        id: dto.id,
        userId,
        fullName: dto.fullName,
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        placeOfBirth: dto.placeOfBirth,
        bloodType: dto.bloodType,
        photoUrl: dto.photoUrl,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateChildDto) {
    await this.findOne(id, userId);

    return this.prisma.child.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: new Date(dto.dateOfBirth),
        }),
        ...(dto.placeOfBirth !== undefined && {
          placeOfBirth: dto.placeOfBirth,
        }),
        ...(dto.bloodType !== undefined && { bloodType: dto.bloodType }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.child.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }
}
