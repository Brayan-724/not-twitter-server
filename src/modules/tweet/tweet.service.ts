import { Injectable } from '@nestjs/common';
import { Tweet } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TweetDto, TweetVisibility } from './dto/tweet.dto';
import { TweetFilters } from './interface/tweet-filters.interface';

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
        toxic: {
          connect: {
            id: tweet.toxicId,
          },
        },
        visibility: tweet.visibility,
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
    return await this.prismaService.getPrisma().tweet.findUnique({
      where: { id },
    });
  }

  async findByToxic(toxicId: string): Promise<Tweet[]> {
    return await this.prismaService.getPrisma().tweet.findMany({
      where: {
        toxicId: toxicId,
      },
    });
  }

  async findWithFilters(filters: TweetFilters): Promise<Tweet[] | null> {
    const { quantity = 50, toxicId, visibility } = filters;

    const where = {};
    if (toxicId) where['toxicId'] = toxicId;
    if (visibility) where['visibility'] = visibility;

    try {
      const tweets = await this.prismaService.getPrisma().tweet.findMany({
        where: {
          ...where,
        },
        take: quantity,
      });

      return tweets;
    } catch (e) {
      console.error(e);
      return null;
    }
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

  validateTweetVisiblity(visibility: TweetVisibility): boolean {
    return (
      visibility === TweetVisibility.PRIVATE ||
      visibility === TweetVisibility.PUBLIC ||
      visibility === TweetVisibility.HIDDEN
    );
  }
}
