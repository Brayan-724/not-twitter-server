import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';

describe('TweetController', () => {
  let controller: TweetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [TweetController],
      providers: [PrismaService, TweetService],
    }).compile();

    controller = module.get<TweetController>(TweetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
