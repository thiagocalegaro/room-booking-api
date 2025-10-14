import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  // Antes de cada teste, cria uma instância completa da sua aplicação
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importa seu módulo principal
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // IMPORTANTE: Aplica as mesmas configurações globais do seu main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  // Garante que a aplicação seja fechada após os testes
  afterEach(async () => {
    await app.close();
  });

  // --- NOSSO TESTE DE LOGIN ---

  it('POST /auth/login - Deve logar um usuário válido e retornar um token', () => {
    // IMPORTANTE: Garanta que este usuário exista no seu banco de dados de teste
    const loginDto = {
      email: 'thiagoacmartin@gmail.com',
      senha: '123456', 
    };

    return request(app.getHttpServer()) // Inicia a requisição
      .post('/auth/login')              // Para o endpoint /auth/login
      .send(loginDto)                   // Com o corpo (body) da requisição
      .expect(200)                      // Espera que o status da resposta seja 200 (OK)
      .expect((res) => {                // Faz verificações no corpo da resposta
        expect(res.body).toHaveProperty('access_token');
        expect(typeof res.body.access_token).toBe('string');
      });
  });

  it('POST /auth/login - Deve rejeitar um usuário com senha inválida', () => {
    const loginDto = {
      email: 'admin@exemplo.com',
      senha: 'senha-errada',
    };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401) // Espera que o status da resposta seja 401 (Unauthorized)
      .expect((res) => {
        expect(res.body.message).toEqual('Credenciais inválidas');
      });
  });
});