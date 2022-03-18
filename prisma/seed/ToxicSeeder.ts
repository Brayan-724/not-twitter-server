import faker from '@faker-js/faker';
import { Toxic } from '@prisma/client';
import { SeederMethods, Seeder } from './Seeder';

export class ToxicSeeder
  extends Seeder<'Toxic'>
  implements SeederMethods<Toxic>
{
  modelName: 'Toxic' = 'Toxic';

  async clearTable(): Promise<void> {
    await this.prisma.getPrisma().toxic.deleteMany({});
  }

  async seedTable(): Promise<void> {
    const count: number = (Math.random() * 10 + 1) | 0;
    await this.clearTable();
    await this.seedMany(count);
  }

  generateOne(data?: Partial<Toxic>): Omit<Toxic, 'id'> {
    const nickname = data?.name ?? faker.internet.userName();
    const username =
      data?.username ?? faker.internet.userName(nickname).slice(0, 15);
    const email = data?.email ?? faker.internet.email(username);
    const password = faker.internet.password();
    // const avatar = faker.internet.avatar();
    const description = data?.description ?? faker.lorem.sentence();
    const birthday = data?.birthday ?? faker.date.past().getTime();
    const createdAt = data?.createdAt ?? faker.date.past(0);

    return {
      name: nickname,
      username,
      email,
      password,
      description,
      birthday,
      createdAt,
      updatedAt: createdAt,
      followers: [],
      following: [],
    } as Omit<Toxic, 'id'>;
  }

  generateMany(count: number, data?: Partial<Toxic>): Omit<Toxic, 'id'>[] {
    const users = [];

    for (let i = 0; i < Math.max(count, 1); i++) {
      users.push(this.generateOne(data));
    }

    return users;
  }

  async seedOne(): Promise<Toxic> {
    const toxic = this.generateOne();

    const passwordHash = await this.authStrategy.generateHash(
      toxic.username,
      toxic.password,
    );

    return this.prisma.getPrisma().toxic.create({
      data: {
        ...toxic,
        password: passwordHash,
      },
    });
  }

  async seedMany(count: number): Promise<Toxic[]> {
    const toxics = this.generateMany(count);

    // Create all toxics in parallel
    return await Promise.all(
      toxics.map(async (toxic) => {
        const passwordHash = await this.authStrategy.generateHash(
          toxic.username,
          toxic.password,
        );

        return this.prisma
          .getPrisma()
          .toxic.create({ data: { ...toxic, password: passwordHash } });
      }),
    );
  }

  async seedOneWith(data: Partial<Toxic>): Promise<Toxic> {
    const toxic = this.generateOne(data);

    const passwordHash = await this.authStrategy.generateHash(
      toxic.username,
      toxic.password,
    );

    return this.prisma.getPrisma().toxic.create({
      data: {
        ...toxic,
        password: passwordHash,
      },
    });
  }

  async seedManyWith(count: number, data: Partial<Toxic>): Promise<Toxic[]> {
    const toxics = this.generateMany(count, data);

    // Create all toxics in parallel
    return await Promise.all(
      toxics.map((toxic) =>
        this.prisma.getPrisma().toxic.create({ data: toxic }),
      ),
    );
  }
}
