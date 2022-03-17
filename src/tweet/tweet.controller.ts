import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TweetDto } from './dto/tweet.dto';
import { TweetService } from './tweet.service';

@Controller('tweets')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Get('/')
  public tweets() {
    return this.tweetService.findAll();
  }

  @Get('/:id')
  public tweet(id: string) {
    return this.tweetService.findOne(id);
  }

  @Delete('/:id')
  public delete(@Param('id') id: string) {
    return this.tweetService.delete(id);
  }

  @Post('/')
  public async create(@Res() res: Response, @Body('tweet') tweet: TweetDto) {
    if (!tweet) {
      return res.status(400).send({ error: 'Tweet is required' });
    }

    if (!tweet.content) {
      return res.status(400).send({ error: 'Content is required' });
    }

    if (!tweet.toxicId) {
      return res.status(400).send({ error: 'Toxic is required' });
    }

    const idOrNull = await this.tweetService.create(tweet);

    if (idOrNull === null) {
      return res.status(400).send({ error: 'Toxic not exist' });
    }

    return res.status(201).send({ id: idOrNull });
  }
}
