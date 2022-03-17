import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [TweetController],
  imports: [PrismaModule],
  providers: [PrismaService, TweetService],
  exports: [TweetService],
})
export class TweetModule {}
