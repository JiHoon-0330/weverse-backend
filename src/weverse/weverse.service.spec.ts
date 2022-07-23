import { Test, TestingModule } from '@nestjs/testing';
import { WeverseService } from './weverse.v2.service';

describe('WeverseService', () => {
  let service: WeverseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeverseService],
    }).compile();

    service = module.get<WeverseService>(WeverseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
