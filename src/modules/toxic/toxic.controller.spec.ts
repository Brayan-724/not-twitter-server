import { Test, TestingModule } from '@nestjs/testing';
import { TweetModule } from '../tweet/tweet.module';
import { TweetService } from '../tweet/tweet.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ToxicController } from './toxic.controller';
import { ToxicService } from './toxic.service';

describe('ToxicController', () => {
  let controller: ToxicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, TweetModule],
      controllers: [ToxicController],
      providers: [PrismaService, TweetService, ToxicService],
    }).compile();

    controller = module.get<ToxicController>(ToxicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
