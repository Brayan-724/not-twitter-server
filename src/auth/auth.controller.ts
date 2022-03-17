import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
      expires: new Date(Date.now() + 1000 * 60 * 5),
    });

    res.cookie('not_twitter_refresh', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 10),
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access_token = await this.authService.login(
      (req.user as any).username as string,
      (req.user as any).password as string,
    );

    if (access_token) {
      this.useAccessToken(res, access_token);
    }

    return access_token;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (
      !req?.cookies?.not_twitter_token ||
      !req?.cookies?.not_twitter_refresh
    ) {
      res.status(401);
      return { access_token: null, refresh_token: null };
    }

    const access_token = await this.authService.refresh(
      req.cookies.not_twitter_token,
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
