import { Toxic, Tweet } from '@prisma/client';
import { AuthStrategy } from '../../src/modules/auth/strategies/auth.strategy';
import { PrismaService } from '../../src/modules/prisma/prisma.service';

export interface SeederMethods<T extends Toxic | Tweet> {
  clearTable(): Promise<void>;
  seedTable(): Promise<void>;

  generateOne(): Omit<T, 'id'>;
  generateMany(count: number): Omit<T, 'id'>[];

  seedOne(): Promise<T>;
  seedMany(count: number): Promise<T[]>;

  seedOneWith(data: Partial<T>): Promise<T>;
  seedManyWith(count: number, data: Partial<T>): Promise<T[]>;
}

export class Seeder<M extends 'Toxic' | 'Tweet'> {
  modelName: M;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly authStrategy: AuthStrategy,
  ) {}

  getTypes(): ReturnType<typeof PrismaService.prototype.getModel> {
    return this.prisma.getModel(this.modelName);
  }
}
