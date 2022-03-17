import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TweetModule } from 'src/tweet/tweet.module';
import { TweetService } from 'src/tweet/tweet.service';
import { ToxicController } from './toxic.controller';
import { ToxicService } from './toxic.service';

@Module({
  controllers: [ToxicController],
  imports: [PrismaModule, TweetModule],
  providers: [PrismaService, TweetService, ToxicService],
  exports: [ToxicService],
})
export class ToxicModule {}
