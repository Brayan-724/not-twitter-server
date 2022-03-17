import { Injectable } from '@nestjs/common';
import { Toxic } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToxicService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<Toxic[]> {
    return this.prismaService.getPrisma().toxic.findMany({});
  }

  findOne(id: string): Promise<Toxic> {
    return this.prismaService.getPrisma().toxic.findFirst({
      where: {
        id,
      },
    });
  }
}
