import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Toxic, Tweet } from '@prisma/client';

const ToxicModel = {
  name: String,
  username: String,
  email: String,
  password: String,
  description: String,
  birthday: Number,
  createdAt: Date,
  updatedAt: Date,
  followers: Array,
  following: Array,
};

const TweetModel = {
  content: String,
  createdAt: Date,
  updatedAt: Date,
};

@Injectable()
export class PrismaService implements OnModuleInit {
  private static client: PrismaClient;
  private ToxicModel = ToxicModel;

  private TweetModel = TweetModel;

  async onModuleInit() {
    if (!this.client) {
      this.client = new PrismaClient();
      await this.client.$connect();
    }
  }

  get client() {
    return PrismaService.client;
  }

  private set client(client: PrismaClient) {
    PrismaService.client = client;
  }

  getPrisma() {
    return this.client;
  }

  getInstance() {
    return this.client;
  }

  getModel<M extends 'Toxic'>(name: M): typeof ToxicModel;
  getModel<M extends 'Tweet'>(name: M): typeof TweetModel;
  getModel<M extends 'Toxic' | 'Tweet'>(
    name: M,
  ): typeof ToxicModel | typeof TweetModel;
  getModel<M extends 'Toxic' | 'Tweet'>(name: M) {
    switch (name) {
      case 'Toxic':
        return this.ToxicModel;
      case 'Tweet':
        return this.TweetModel;
      default:
        return {};
    }
  }
}
