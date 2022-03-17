import faker from '@faker-js/faker';
import { Toxic, Tweet } from '@prisma/client';
import { Seeder, SeederMethods } from './Seeder';

export class TweetSeeder
  extends Seeder<'Tweet'>
  implements SeederMethods<Tweet>
{
  modelName: 'Tweet' = 'Tweet';
  private _toxic: Toxic;

  get target(): Toxic {
    return this._toxic;
  }

  set target(toxic: Toxic) {
    this._toxic = toxic;
  }

  async clearTable(): Promise<void> {
    await this.prisma.getPrisma().tweet.deleteMany({});
  }

  async seedTable(): Promise<void> {
    const count = (Math.random() * 10 + 1) | 0;

    await this.seedMany(count);
  }

  async seedOne(): Promise<Tweet> {
    const tweet = this.generateOne();

    return await this.prisma.getPrisma().tweet.create({
      data: tweet,
    });
  }

  async seedOneWith(data: Partial<Tweet>): Promise<Tweet> {
    const tweet = this.generateOne(data);

    return await this.prisma.getPrisma().tweet.create({
      data: tweet,
    });
  }

  async seedMany(count: number): Promise<Tweet[]> {
    const tweets = this.generateMany(count);

    // Create the tweets in parallel
    return await Promise.all(
      tweets.map((tweet) =>
        this.prisma.getPrisma().tweet.create({ data: tweet }),
      ),
    );
  }

  async seedManyWith(count: number, data: Partial<Tweet>): Promise<Tweet[]> {
    const tweets = this.generateMany(count, data);

    // Create the tweets in parallel
    return await Promise.all(
      tweets.map((tweet) =>
        this.prisma.getPrisma().tweet.create({ data: tweet }),
      ),
    );
  }

  generateOne(data?: Partial<Tweet>): Omit<Tweet, 'id'> {
    const content = data?.content ?? faker.lorem.sentence();
    const createdAt = data?.createdAt ?? faker.date.past();
    const updatedAt = data?.updatedAt ?? faker.date.recent();

    return {
      content,
      toxicId: this.target.id,
      createdAt,
      updatedAt,
    } as Omit<Tweet, 'id'>;
  }

  generateMany(count: number, data?: Partial<Tweet>): Omit<Tweet, 'id'>[] {
    const toxics: Omit<Tweet, 'id'>[] = [];

    for (let i = 0; i < Math.max(1, count); i++) {
      toxics.push(this.generateOne(data));
    }

    return toxics;
  }
}
