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

  it('GET /salas/codigo - testa criar uma sala', () => {
    const salaDto = {
      codigo: 'g201',
      bloco: 'G',
      tipo: 'reunião',
      capacidade: 30,
      hora_inicio: '08:00',
      hora_fim: '18:00',
    };
    return request(app.getHttpServer())
      .post()
      .send(salaDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBe('string');
      });
  });
});
