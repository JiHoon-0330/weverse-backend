import { Test, TestingModule } from '@nestjs/testing';
import { WeverseController } from './weverse.controller';

describe('WeverseController', () => {
  let controller: WeverseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeverseController],
    }).compile();

    controller = module.get<WeverseController>(WeverseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
