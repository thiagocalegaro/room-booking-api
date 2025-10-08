import { Test, TestingModule } from '@nestjs/testing';
import { ExcecoesController } from './excecoes.controller';
import { ExcecoesService } from './excecoes.service';

describe('ExcecoesController', () => {
  let controller: ExcecoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExcecoesController],
      providers: [ExcecoesService],
    }).compile();

    controller = module.get<ExcecoesController>(ExcecoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
