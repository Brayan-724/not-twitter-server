import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TweetDto, TweetVisibility } from './dto/tweet.dto';
import { TweetService } from './tweet.service';

@Controller('tweets')
export class TweetController {
  constructor(
    private readonly tweetService: TweetService,
    private readonly authService: AuthService,
  ) {}

  @Get('/')
  public async tweets(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(req.cookies);
    // Take my data if I'm logged in
    const me = await this.authService.me(req);

    // If I'm not logged in, return only public tweets
    const visibility = me ? undefined : TweetVisibility.PUBLIC;

    const tweets = await this.tweetService.findWithFilters({
      visibility,
    });

    // If occurs an error, return an empty array with statusCode 404
    if (tweets === null) {
      res.status(404);
      return [];
    }

    return tweets
      .map((tweet) => {
        // If the tweet is public or it's mine, return the whole tweet
        if (
          tweet.visibility === TweetVisibility.PUBLIC ||
          tweet.toxicId === me?.id
        ) {
          return tweet;
        }

        // If the tweet is private, filter it
        if (tweet.visibility === TweetVisibility.PRIVATE) {
          //TODO: add private tweets
          return null;
        }

        // For any other case, return null
        return null;
      })
      .filter((tweet) => tweet !== null);
  }

  @Get('/:id')
  public tweet(@Param('id') id: string) {
    return this.tweetService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  public delete(@Param('id') id: string) {
    this.tweetService.delete(id);
    return {
      message: 'Tweet deleted',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  public async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body('tweet') tweet: TweetDto,
  ) {
    const me = await this.authService.me(req);

    if (!me) {
      return res.status(401).send({ statusCode: 401, error: 'Unauthorized' });
    }

    if (!tweet) {
      return res.status(400).send({ error: 'Tweet is required' });
    }

    if (!tweet.content) {
      return res.status(400).send({ error: 'Content is required' });
    }

    if (
      typeof tweet.visibility !== 'undefined' &&
      !this.tweetService.validateTweetVisiblity(tweet.visibility)
    ) {
      return res.status(400).send({ error: 'Invalid visibility' });
    }

    const idOrNull = await this.tweetService.create({
      content: tweet.content,
      toxicId: me.id,
      visibility: tweet.visibility,
    });

    // TODO: Error handling
    // TODO: Status code
    if (idOrNull === null) {
      return res.status(500).send({ error: 'Error ' });
    }

    return res.status(201).send({ id: idOrNull });
  }
}
