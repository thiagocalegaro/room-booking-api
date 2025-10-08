import { Module } from '@nestjs/common';
import { RecursosService } from './recursos.service';
import { RecursosController } from './recursos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { SalaRecurso } from '../salas/entities/sala_recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso, SalaRecurso])],
  controllers: [RecursosController],
  providers: [RecursosService],
})
export class RecursosModule {}
