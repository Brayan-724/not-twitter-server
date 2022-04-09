import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Toxic } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookieTokens } from './interfaces/cookie-tokens.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private useAccessToken(res: Response, tokens: CookieTokens) {
    res.cookie('not_twitter_token', tokens.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1.5),
    });

    res.cookie('not_twitter_refresh', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access_token = await this.authService.login(
      req.body.username,
      req.body.password,
    );

    if (access_token) {
      this.useAccessToken(res, access_token);
    } else {
      res.status(401);
      return { access_token: null, refresh_token: null };
    }

    return access_token;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('not_twitter_token');
    res.clearCookie('not_twitter_refresh');
    return { success: true };
  }

  @Post('register')
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,

    @Body('username') username: string,
    @Body('password') password: string,
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('birthday') birthday: number,
  ) {
    if (!username || !password) {
      res.status(400);
      return { error: 'username and password are required' };
    }

    if (username.toLowerCase() !== username) {
      res.status(400);
      return { error: 'username must be in lowercase' };
    }

    if (username.length < 4) {
      res.status(400);
      return { error: 'Username must be at least 4 characters long' };
    }

    if (username.length > 15) {
      res.status(400);
      return { error: 'Username must be less than 15 characters long' };
    }

    if (password.length < 8) {
      res.status(400);
      return { error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 33) {
      res.status(400);
      return { error: 'Password must be less than 33 characters long' };
    }

    const access_token = await this.authService.register({
      name,
      username,
      password,
      email,
      description,
      birthday,
    } as unknown as Toxic);

    if (access_token) {
      this.useAccessToken(res, access_token);
    } else {
      res.status(400);
      return { error: 'Username already exists' };
    }

    return access_token;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req?.cookies?.not_twitter_refresh) {
      res.status(401);
      return { access_token: null, refresh_token: null };
    }

    const access_token = await this.authService.refresh(
      req.cookies.not_twitter_refresh,
    );

    if (access_token) {
      this.useAccessToken(res, access_token);
    }

    return access_token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }
}
