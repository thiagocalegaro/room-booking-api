import { Module } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sala } from './entities/sala.entity';
import { SalaRecurso } from './entities/sala_recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sala, SalaRecurso])], 
  controllers: [SalasController],
  providers: [SalasService],
  exports: [SalasService],
})
export class SalasModule {}
