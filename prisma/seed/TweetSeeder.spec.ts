import { Toxic, Tweet } from '@prisma/client';
import { AuthStrategy } from '../../src/auth/strategies/auth.strategy';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ToxicSeeder } from './ToxicSeeder';
import { TweetSeeder } from './TweetSeeder';

const prismaService = new PrismaService();
const authStrategy = new AuthStrategy(prismaService);
const toxicSeeder = new ToxicSeeder(prismaService, authStrategy);

prismaService.onModuleInit();

function generateModelTest() {
  return {
    content: expect.any(String),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };
}

function validate(toxic: Omit<Tweet, 'id'>) {
  expect(toxic).toMatchObject(generateModelTest());
}

describe('TweetSeeder', () => {
  let instance: TweetSeeder;
  let toxic: Toxic;

  beforeEach(async () => {
    toxic = await toxicSeeder.seedOne();
    instance = new TweetSeeder(prismaService, authStrategy);

    instance.target = toxic;
  });

  it('should be instantiable', () => {
    expect(instance).toBeDefined();
  });

  // Should be implemented in the child class
  it('should have a modelName', () => {
    expect(instance.modelName).toBe('Tweet');
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
  ] as (keyof TweetSeeder)[][])('should have a %s method', (method) => {
    expect(instance[method]).toBeDefined();
  });

  it('should clear the table (Without errors)', async () => {
    await instance.clearTable();
  });

  it('should generate a Tweet', () => {
    const tweet = instance.generateOne();

    validate(tweet);
  });

  it('should generate many tweets', () => {
    const tweets = instance.generateMany(5);

    tweets.forEach((tweet) => validate(tweet));
  });

  it('should seed a Tweet', async () => {
    const tweet = await instance.seedOne();

    validate(tweet);
  });

  it('should seed many tweets', async () => {
    const tweets = await instance.seedMany(5);

    tweets.forEach((tweet) => validate(tweet));
  });

  it('should seed the table (Without errors)', async () => {
    await instance.seedTable();
  });

  it('should clear the table (Without errors)', async () => {
    await instance.clearTable();
  });
});
