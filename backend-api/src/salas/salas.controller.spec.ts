import { Test, TestingModule } from '@nestjs/testing';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

describe('SalasController', () => {
  let controller: SalasController;

  const mockSalasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalasController],
      providers: [{ provide: SalasService, useValue: mockSalasService }],
    }).compile();

    controller = module.get<SalasController>(SalasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});