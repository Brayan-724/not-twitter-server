import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [TweetController],
  imports: [PrismaModule, AuthModule],
  providers: [PrismaService, TweetService, AuthService],
  exports: [TweetService],
})
export class TweetModule {}
