import { Module } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento } from './entities/agendamento.entity';
import { SalasModule } from '../salas/salas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agendamento]),
    SalasModule,
    UsuariosModule,
  ],
  controllers: [AgendamentosController],
  providers: [AgendamentosService],
})
export class AgendamentosModule {}
