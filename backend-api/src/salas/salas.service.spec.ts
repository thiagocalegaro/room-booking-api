import { Test, TestingModule } from '@nestjs/testing';
import { SalasService } from './salas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sala } from './entities/sala.entity';

describe('SalasService', () => {
  let service: SalasService;

  const mockSalaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalasService,
        {
          provide: getRepositoryToken(Sala),
          useValue: mockSalaRepository,
        },
      ],
    }).compile();

    service = module.get<SalasService>(SalasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});