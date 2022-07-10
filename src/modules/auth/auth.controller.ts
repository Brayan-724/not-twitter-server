import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Toxic } from '@prisma/client';
import { Request, Response } from 'express';
import { UseValidator } from 'src/utils/BodyValidator/useValidator.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookieTokens } from './interfaces/cookie-tokens.interface';
import { LoginValidator } from './validators/login.validator';
import { RegisterUserDto } from './validators/register.dto';
import { RegisterValidator } from './validators/register.validator';

@Controller('auth')
export class AuthController {
  private registerValidator = new RegisterValidator();
  private loginValidator = new LoginValidator();

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
    const validation = this.loginValidator.validate(req);

    if (validation[0] === false) {
      return validation[1].toApiErrorResponse();
    }

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
    @UseValidator(new RegisterValidator()) body: RegisterUserDto,
  ) {
    const access_token = await this.authService.register({
      name: body.name,
      username: body.username,
      password: body.password,
      email: body.email,
      description: body.description,
      birthday: body.birthday,
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
