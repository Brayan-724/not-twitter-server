import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Toxic } from '@prisma/client';
import { Request, Response } from 'express';
import {
  BodyValidator,
  GlobalValidator,
  NumberCaseValidator,
  PartValidator,
  StringCaseValidator,
} from 'src/utils/BodyValidator/index';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookieTokens } from './interfaces/cookie-tokens.interface';

@Controller('auth')
export class AuthController {
  private registerValidator = new BodyValidator();

  constructor(private readonly authService: AuthService) {
    this.registerValidator
      .getPart(
        new PartValidator('username').isRequired().case(
          new StringCaseValidator()
            .isRequired()
            .minLength(4)
            .maxLength(15)
            .isLowerCase(true)
            .regex(
              /^[a-z0-9_]+$/,
              'Username can only contain lowercase letters and numbers',
            ),
        ),
      )
      .getPart(
        new PartValidator('password')
          .isRequired()
          .case(
            new StringCaseValidator().isRequired().minLength(8).maxLength(33),
          ),
      )
      .getPart(
        new PartValidator('name')
          .isRequired()
          .case(
            new StringCaseValidator().isRequired().minLength(4).maxLength(20),
          ),
      )
      .getPart(
        new PartValidator('email').isRequired().case(
          new StringCaseValidator()
            .isRequired()
            .minLength(4)
            .maxLength(50)
            .regex(
              /^(\w|\.){3,}@[a-z]{3,}(\.[a-z]{2,})+$/,
              'Invalid email format',
            ),
        ),
      )
      .getPart(
        new PartValidator('description')
          .globalCase(new GlobalValidator().default(''))
          .case(new StringCaseValidator()),
      )
      .getPart(
        new PartValidator('birthday').case(
          new NumberCaseValidator().min(1000000),
        ),
      );
  }

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
  ) {
    const validation = this.registerValidator.validate(req);

    if (validation[0] === false) {
      res.status(400);
      return {
        statusCode: 400,
        message: validation[1].toString(),
        details: validation[1].getDetails(),
      };
    }

    const body = validation[1] as any;

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
