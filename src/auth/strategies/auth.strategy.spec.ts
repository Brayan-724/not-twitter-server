import { JwtService } from '@nestjs/jwt';
import { Toxic } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthStrategy } from './auth.strategy';

const prismaService = new PrismaService();
const jwtService = new JwtService({
  secret: process.env.JWT_SECRET as string,
});

describe('AuthStrategy', () => {
  let instance: AuthStrategy;

  beforeEach(async () => {
    await prismaService.onModuleInit();
    instance = new AuthStrategy(prismaService, jwtService);
  });

  it('should be defined', () => {
    expect(instance).toBeDefined();
  });

  it('should generateToHash', () => {
    const username = 'username';
    const password = 'password';
    const result = instance.generateToHash(username, password);
    expect(result).toBe(`${username}:${password}`);
  });

  it('should generateHash', async () => {
    const username = 'username';
    const password = 'password';
    const result = await instance.generateHash(username, password);
    expect(result).toBeDefined();
  });

  it('should compareHash', async () => {
    const username = 'username';
    const password = 'password';
    const hash = await instance.generateHash(username, password);
    const result = await instance.compareHash(username, password, hash);
    expect(result).toBe(true);
  });

  it('should compareHash with toxic', async () => {
    const toxic = {
      username: 'username',
      password: 'password',
    } as Toxic;
    const hash = await instance.generateHash(toxic.username, toxic.password);
    const result = await instance.compareHash(toxic, hash);
    expect(result).toBe(true);
  });

  it('Should validateToxic', async () => {
    const toxic = await prismaService.getPrisma().toxic.create({
      data: {
        name: 'name',
        username: 'username' + new Date().getTime(),
        password: 'password',
        birthday: new Date().getTime(),
        email: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const result = await instance.validateToxic(toxic.username, toxic.password);
    expect(result).toBeTruthy();
    expect(result).toEqual(toxic);
  });
});
