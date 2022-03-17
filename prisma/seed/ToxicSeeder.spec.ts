import { Toxic } from '@prisma/client';
import { AuthStrategy } from '../../src/auth/strategies/auth.strategy';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ToxicSeeder } from './ToxicSeeder';

const prismaService = new PrismaService();
const authStrategy = new AuthStrategy(prismaService);

prismaService.onModuleInit();

function generateModelTest() {
  return {
    name: expect.any(String),
    username: expect.any(String),
    email: expect.any(String),
    password: expect.any(String),
    description: expect.any(String),
    birthday: expect.any(Number),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    followers: expect.any(Array),
    following: expect.any(Array),
  };
}

function validate(toxic: Omit<Toxic, 'id'>) {
  expect(toxic).toMatchObject(generateModelTest());
}

describe('ToxicSeeder', () => {
  let instance: ToxicSeeder;

  beforeEach(() => {
    instance = new ToxicSeeder(prismaService, authStrategy);
  });

  it('should be instantiable', () => {
    expect(instance).toBeDefined();
  });

  // Should be implemented in the child class
  it('should have a modelName', () => {
    expect(instance.modelName).toBe('Toxic');
  });

  it.each([
    ['clearTable'],
    ['generateMany'],
    ['generateOne'],
    ['seedMany'],
    ['seedManyWith'],
    ['seedOne'],
    ['seedOneWith'],
    ['seedTable'],
    ['getTypes'],
  ] as (keyof ToxicSeeder)[][])('should have a %s method', (method) => {
    expect(instance[method]).toBeDefined();
  });

  it('should clear the table (Without errors)', async () => {
    await instance.clearTable();
  });

  it('should generate a Toxic', () => {
    const toxic = instance.generateOne();

    validate(toxic);
  });

  it('should generate many toxics', () => {
    const toxics = instance.generateMany(5);

    toxics.forEach((toxic) => validate(toxic));
  });

  it('should seed a Toxic', async () => {
    const toxic = await instance.seedOne();

    validate(toxic);
  });

  it('should seed many toxics', async () => {
    const toxics = await instance.seedMany(5);

    toxics.forEach((toxic) => validate(toxic));
  });

  it('should seed the table (Without errors)', async () => {
    await instance.seedTable();
  });

  it('should clear the table (Without errors)', async () => {
    await instance.clearTable();
  });
});
