import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Toxic } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CookieTokens } from '../interfaces/cookie-tokens.interface';
import { JWTPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthStrategy {
  private readonly saltRounds = 10;

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

    const passwordHash = await this.generateHash(username, password);

    const toxic = await this.prismaService.getPrisma().toxic.findFirst({
      where: {
        username,
      },
    });

    if (!toxic) {
      return null;
    }

    const isValid = await this.compareHash(toxic, passwordHash);

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

  generateToken<R extends boolean = false>(payload: JWTPayload<R>) {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  generateToHash(username: string, password: string) {
    return `${username}:${password}`;
  }

  async generateHash(username: string, password: string) {
    const hash = await bcrypt.hash(
      this.generateToHash(username, password),
      this.saltRounds,
    );

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

    const isValid = await bcrypt.compare(
      this.generateToHash(toxic.username, toxic.password),
      hash,
    );

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

  async refreshToken(
    access_token: string,
    refresh_token: string,
  ): Promise<CookieTokens | null> {
    // const isValidToken = await this.validateRefreshToken(
    //   access_token,
    //   refresh_token,
    // );

    // if (!isValidToken) {
    //   return null;
    // }

    const oldPayload = this.jwtService.decode(
      refresh_token,
    ) as JWTPayload<false>;

    return this.login(oldPayload);
  }
}
