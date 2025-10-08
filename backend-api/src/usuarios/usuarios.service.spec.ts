// src/usuarios/usuarios.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: Repository<Usuario>;

  const mockUsuarioRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar um usuário quando as credenciais estiverem corretas', async () => {
      const mockUser = { id: 1, email: 'teste@teste.com', senha: 'hashedPassword' } as Usuario;
      
      mockUsuarioRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('teste@teste.com', 'senhaCorreta');
      const { senha, ...userSemSenha } = mockUser;

      expect(result).toEqual(mockUser);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      const mockUser = { id: 1, email: 'teste@teste.com', senha: 'hashedPassword' } as Usuario;

      mockUsuarioRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); 

      await expect(service.login('teste@teste.com', 'senhaErrada')).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null); 

      await expect(service.login('naoexiste@teste.com', 'qualquerSenha')).rejects.toThrow(UnauthorizedException);
    });
  });
});