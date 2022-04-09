import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TweetVisibility } from './dto/tweet.dto';
import { TweetService } from './tweet.service';

describe('TweetService', () => {
  let service: TweetService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PrismaService, TweetService],
    }).compile();

    service = module.get<TweetService>(TweetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('.validateTweetVisiblity', () => {
    expect(service.validateTweetVisiblity(TweetVisibility.PUBLIC)).toBe(true);
    expect(service.validateTweetVisiblity(TweetVisibility.PRIVATE)).toBe(true);
    expect(service.validateTweetVisiblity(TweetVisibility.HIDDEN)).toBe(true);
    // @ts-expect-error - Just a test
    expect(service.validateTweetVisiblity('public')).toBe(false);
    // @ts-expect-error - Just a test
    expect(service.validateTweetVisiblity('private')).toBe(false);
    // @ts-expect-error - Just a test
    expect(service.validateTweetVisiblity('hidden')).toBe(false);
  });
});
