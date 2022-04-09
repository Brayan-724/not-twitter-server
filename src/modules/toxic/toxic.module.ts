import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TweetModule } from '../tweet/tweet.module';
import { TweetService } from '../tweet/tweet.service';
import { ToxicController } from './toxic.controller';
import { ToxicService } from './toxic.service';

@Module({
  controllers: [ToxicController],
  imports: [PrismaModule, TweetModule],
  providers: [PrismaService, TweetService, ToxicService],
  exports: [ToxicService],
})
export class ToxicModule {}
