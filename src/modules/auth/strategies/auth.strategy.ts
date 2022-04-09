import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Toxic } from '@prisma/client';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { CookieTokens } from '../interfaces/cookie-tokens.interface';
import { JWTPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthStrategy {
  private readonly cryptoHashSecret = process.env.JWT_SECRET as string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateToxic(
    username?: string,
    password?: string,
  ): Promise<Toxic | null> {
    if (!username || !password) {
      return null;
    }

    const toxic = await this.prismaService.getPrisma().toxic.findFirst({
      where: {
        username,
      },
    });

    if (!toxic) {
      return null;
    }

    const isValid = await this.compareHash(
      toxic.username,
      password,
      toxic.password,
    );

    if (!isValid) {
      return null;
    }

    return toxic;
  }

  async login(toxic: Toxic | JWTPayload<boolean>): Promise<CookieTokens> {
    const timestamp = Date.now();
    const payload = {
      id: toxic.id,
      username: toxic.username,
      timestamp,
    } as JWTPayload;

    const payloadRefresh = {
      id: toxic.id,
      username: toxic.username,
      timestamp,
      refresh: true,
      access_token: this.generateToken(payload),
    } as JWTPayload<true>;

    return {
      access_token: payloadRefresh.access_token,
      refresh_token: this.generateToken(payloadRefresh),
    };
  }

  async register(data: Toxic): Promise<CookieTokens | null> {
    try {
      const hasAlreadyToxic = await this.prismaService
        .getPrisma()
        .toxic.findFirst({
          where: {
            username: data.username,
          },
        });

      if (hasAlreadyToxic) {
        return null;
      }

      const toxic = await this.prismaService.getPrisma().toxic.create({
        data: {
          ...data,
          password: await this.generateHash(data.username, data.password),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return this.login(toxic);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  generateToken<R extends boolean = false>(payload: JWTPayload<R>) {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  generateToHash(username: string, password: string) {
    return `${username}:${password}`;
  }

  async generateHash(username: string, password: string) {
    const hash = crypto
      .createHmac('sha256', this.cryptoHashSecret)
      .update(this.generateToHash(username, password))
      .digest('base64');

    return hash;
  }

  async compareHash(
    username: string,
    password: string,
    hash: string,
  ): Promise<boolean>;

  async compareHash(toxic: Toxic, hash: string): Promise<boolean>;

  async compareHash(
    usernameOrToxic: string | Toxic,
    passwordOrHash: string,
    maybeHash?: string,
  ) {
    const hash = maybeHash || passwordOrHash;
    const toxic =
      typeof usernameOrToxic === 'string'
        ? ({ username: usernameOrToxic, password: passwordOrHash } as Toxic)
        : usernameOrToxic;

    const hashed = await this.generateHash(toxic.username, toxic.password);

    const isValid = hash === hashed;

    return isValid;
  }

  async validateRefreshToken(
    access_token: string,
    refresh_token: string,
  ): Promise<boolean> {
    const payload = this.jwtService.decode(access_token) as JWTPayload<false>;
    const payloadRefresh = this.jwtService.decode(
      refresh_token,
    ) as JWTPayload<true>;

    if (!payload || !payloadRefresh) {
      return false;
    }

    if (
      payload.id !== payloadRefresh.id ||
      payload.username !== payloadRefresh.username ||
      payload.timestamp !== payloadRefresh.timestamp ||
      payloadRefresh.access_token !== access_token
    ) {
      return false;
    }

    return true;
  }

  async refreshToken(refresh_token: string): Promise<CookieTokens | null> {
    const oldPayload = this.jwtService.decode(
      refresh_token,
    ) as JWTPayload<false>;

    return this.login(oldPayload);
  }

  async me(req: Request): Promise<Toxic | null> {
    const jwtToken = req?.cookies?.not_twitter_token as string | undefined;

    if (!jwtToken) {
      return null;
    }

    const payload = this.jwtService.decode(jwtToken) as JWTPayload<false>;

    if (!payload) {
      return null;
    }

    const toxic = await this.prismaService.getPrisma().toxic.findUnique({
      where: {
        id: payload.id,
      },
    });

    return toxic;
  }
}
