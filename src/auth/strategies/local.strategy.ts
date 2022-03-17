import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Toxic } from '@prisma/client';
import { Strategy } from 'passport-local';
import { AuthStrategy } from './auth.strategy';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authStrategy: AuthStrategy) {
    super();
  }

  async validate(username: string, password: string): Promise<Toxic | null> {
    const toxic = await this.authStrategy.validateToxic(username, password);

    if (!toxic) {
      return null;
    }

    return toxic;
  }
}
