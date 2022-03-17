import { Injectable } from '@nestjs/common';
import { Tweet } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TweetDto } from './dto/tweet.dto';

@Injectable()
export class TweetService {
  static tweets: string[] = [];

  constructor(private readonly prismaService: PrismaService) {}

  async create(tweet: TweetDto): Promise<string | null> {
    const error = this.validateTweet(tweet.content);

    if (error !== null) {
      throw error;
    }

    const toxic = await this.prismaService.getPrisma().toxic.findUnique({
      where: {
        id: tweet.toxicId,
      },
    });

    if (toxic === null) {
      return null;
    }

    const newTweet = await this.prismaService.getPrisma().tweet.create({
      data: {
        content: tweet.content,
        // toxicId: tweet.toxicId,
        toxic: {
          connect: {
            id: tweet.toxicId,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return newTweet.id;
  }

  async findAll(): Promise<Tweet[]> {
    return await this.prismaService.getPrisma().tweet.findMany({});
  }

  async findOne(id: string): Promise<Tweet> {
    return await this.prismaService.getPrisma().tweet.findFirst({
      where: { id },
    });
  }

  async findByToxic(toxicId: string): Promise<Tweet[]> {
    return await this.prismaService.getPrisma().tweet.findMany({
      where: {
        toxic: {
          id: toxicId,
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.getPrisma().tweet.delete({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, tweet: string): Promise<void> {
    const error = this.validateTweet(tweet);

    if (error !== null) {
      throw error;
    }

    if (id < TweetService.tweets.length) {
      throw new Error('Tweet not found');
    }

    // if(TweetService.tweets) {}

    TweetService.tweets[id] = tweet;
  }

  private validateTweet(tweet: string): null | Error {
    if (tweet.length > 140) {
      return new Error('Tweet is too long');
    }

    if (tweet === '') {
      return new Error('Tweet is empty');
    }

    return null;
  }
}
