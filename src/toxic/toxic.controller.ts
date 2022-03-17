import { Controller, Get } from '@nestjs/common';
import { TweetService } from '../tweet/tweet.service';
import { ToxicService } from './toxic.service';

@Controller('toxic')
export class ToxicController {
  constructor(
    private readonly toxicService: ToxicService,
    private readonly tweetService: TweetService,
  ) {}

  @Get('/')
  public async findAll() {
    return this.toxicService.findAll();
  }

  @Get('/:id')
  public async findOne(id: string) {
    return this.toxicService.findOne(id);
  }

  @Get('/:id/tweets')
  public async findByToxic(id: string) {
    return this.tweetService.findByToxic(id);
  }
}
