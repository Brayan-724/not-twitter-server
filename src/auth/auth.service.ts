import { Injectable } from '@nestjs/common';
import { CookieTokens } from './interfaces/cookie-tokens.interface';
import { AuthStrategy } from './strategies/auth.strategy';

@Injectable()
export class AuthService {
  constructor(private readonly authStrategy: AuthStrategy) {}

  async login(
    username: string,
    password: string,
  ): Promise<CookieTokens | null> {
    const toxic = await this.authStrategy.validateToxic(username, password);

    if (!toxic) {
      return null;
    }

    const payload = await this.authStrategy.login(toxic);

    return payload;
  }

  async refresh(refresh_token: string): Promise<CookieTokens | null> {
    const payload = await this.authStrategy.refreshToken(refresh_token);

    return payload;
  }
}
