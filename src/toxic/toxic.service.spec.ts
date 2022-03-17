import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ToxicService } from './toxic.service';

describe('ToxicService', () => {
  let service: ToxicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PrismaService, ToxicService],
    }).compile();

    service = module.get<ToxicService>(ToxicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
