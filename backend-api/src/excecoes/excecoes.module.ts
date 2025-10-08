import { Module } from '@nestjs/common';
import { ExcecoesService } from './excecoes.service';
import { ExcecoesController } from './excecoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Excecao } from './entities/excecoes.entity';
import { SalasModule } from '../salas/salas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Excecao]), SalasModule],
  controllers: [ExcecoesController],
  providers: [ExcecoesService],
})
export class ExcecoesModule {}
