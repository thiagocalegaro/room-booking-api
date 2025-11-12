import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  //teste de login

  it('POST /auth/login - testa login bem sucedido', () => {
    const loginDto = {
      email: 'thiago@admin.com',
      senha: '123456',
    };

    return request(app.getHttpServer())
      .post('/auth/login') //endpoint
      .send(loginDto) //corpo da requisição
      .expect(200)
      .expect((res) => {
        //devolve o token
        expect(res.body).toHaveProperty('access_token');
        expect(typeof res.body.access_token).toBe('string');
      });
  });

  it('POST /auth/login - testa o login inválido', () => {
    const loginDto = {
      email: 'usuarionaocadastrado@gmail.com',
      senha: 'senha',
    };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toEqual('Credenciais inválidas');
      });
  });

  // test/app.e2e-spec.ts

// ... (dentro do describe('/salas', () => { ... }) )

it('POST /salas - deve retornar 401 Unauthorized se nenhum token for enviado', () => {
  // O DTO precisa ser válido para passar pela validação, mesmo que a autenticação falhe antes
  const salaDto = {
    codigo: 'G401-TEST-' + Date.now(),
    capacidade: 10,
    bloco: 'G',
    tipo: 'teste',
    hora_inicio: '08:00:00',
    hora_fim: '18:00:00',
    disponivel_sabado: false,
    disponivel_domingo: false,
    isAtiva: true,
  };

  return request(app.getHttpServer())
    .post('/salas')
    .send(salaDto)
    .expect(401)
    .expect((res) => {
        expect(res.body.message).toEqual('Unauthorized');
    });
  });
});
