import { Test, TestingModule } from '@nestjs/testing';
import { ExcecoesService } from './excecoes.service';

describe('ExcecoesService', () => {
  let service: ExcecoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcecoesService],
    }).compile();

    service = module.get<ExcecoesService>(ExcecoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
