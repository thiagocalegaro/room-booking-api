// src/salas/salas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sala } from './entities/sala.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { Recurso } from 'src/recursos/entities/recurso.entity';
import { SalaRecurso } from './entities/sala_recurso.entity';
import { DataSource, Repository, Not, In, LessThan, MoreThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Agendamento } from 'src/agendamentos/entities/agendamento.entity';
import { TipoExcecao } from 'src/excecoes/enums/tipo-excecao.enum';
import { Excecao } from '../excecoes/entities/excecoes.entity';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private salasRepository: Repository<Sala>,
    
    @InjectRepository(SalaRecurso)
    private salaRecursoRepository: Repository<SalaRecurso>,

    @InjectRepository(Agendamento)
    private agendamentosRepository: Repository<Agendamento>,

    @InjectRepository(Excecao)
    private excecoesRepository: Repository<Excecao>,
    private dataSource: DataSource,
  ) {}

  async create(createSalaDto: CreateSalaDto): Promise<Sala> {
    const { recursos, ...dadosSala } = createSalaDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const novaSala = queryRunner.manager.create(Sala, dadosSala);
      await queryRunner.manager.save(novaSala);

      if (recursos && recursos.length > 0) {
        for (const rec of recursos) {
          const novaRelacao = queryRunner.manager.create(SalaRecurso, {
            sala: novaSala,
            recurso: { id: rec.id } as Recurso, 
            quantidade: rec.quantidade,
          });
          await queryRunner.manager.save(novaRelacao);
        }
      }

      await queryRunner.commitTransaction();
      return novaSala;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(codigo: string, updateSalaDto: UpdateSalaDto): Promise<any> {
    const { recursos, ...dadosSala } = updateSalaDto;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Sala, { codigo }, dadosSala);
      
      const sala = await queryRunner.manager.findOneBy(Sala, { codigo });
      if (!sala) {
        throw new NotFoundException(`Sala ${codigo} não encontrada.`);
      }

      await queryRunner.manager.delete(SalaRecurso, { sala: { codigo } });

      if (recursos && recursos.length > 0) {
        for (const rec of recursos) {
          const novaRelacao = queryRunner.manager.create(SalaRecurso, {
            sala: sala,
            recurso: { id: rec.id } as Recurso,
            quantidade: rec.quantidade,
          });
          await queryRunner.manager.save(novaRelacao);
        }
      }

      await queryRunner.commitTransaction();
      
      return this.findOne(codigo); 

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  
  async findOne(codigo: string) {
    const sala = await this.salasRepository.findOne({
      where: { codigo },
      relations: [
        'salaRecursos', 
        'salaRecursos.recurso', 
      ],
    });
    
    if (!sala) {
      throw new NotFoundException(`Sala com código ${codigo} não encontrada.`);
    }

    const { salaRecursos, ...dadosSala } = sala;
    return {
      ...dadosSala,
      recursos: salaRecursos.map(sr => ({
        recurso: sr.recurso,
        quantidade: sr.quantidade
      }))
    };
  }
  async findAll(): Promise<any[]> {
    const salas = await this.salasRepository.find({
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' } 
    });
    
    return salas.map(this.formatarSala);
  }

  async findAllAtiva(): Promise<any[]> {
    const salas = await this.salasRepository.find({
      where: { isAtiva: true },
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' }
    });
    
    return salas.map(this.formatarSala);
  }

  async findByBloco(bloco: string): Promise<any[]> {
    const salas = await this.salasRepository.find({
      where: { 
        bloco: bloco, 
        isAtiva: true  
      },
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' }
    });
        
    return salas.map(this.formatarSala);
  }

  private formatarSala(sala: Sala): any {
    const { salaRecursos, ...dadosSala } = sala;
    return {
      ...dadosSala,
      recursos: salaRecursos.map(sr => ({
        id: sr.recurso.id,
        nome: sr.recurso.nome,
        quantidade: sr.quantidade
      }))
    };
  }

  async remove(codigo: string): Promise<void> {
    const resultado = await this.salasRepository.delete(codigo);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Sala com código ${codigo} não encontrada.`);
    }
  }

  async findAvailable(data: string, hora_inicio: string, hora_fim: string, capacidade: number): Promise<any[]> {
    
    const conflitos = await this.agendamentosRepository.find({
      where: {
        data: new Date(data),
        hora_inicio: LessThan(hora_fim),  
        hora_fim: MoreThan(hora_inicio), 
      },
      relations: ['sala'], 
    });

    const salasIndisponiveisIds = conflitos.map(agendamento => agendamento.sala.codigo);
    const salasDisponiveis = await this.salasRepository.find({
      where: {
        isAtiva: true,
        capacidade: MoreThanOrEqual(capacidade || 1), 
        hora_inicio: LessThanOrEqual(hora_inicio), 
        hora_fim: MoreThanOrEqual(hora_fim), 
        
        codigo: Not(In(salasIndisponiveisIds)),
      },
      relations: ['salaRecursos', 'salaRecursos.recurso'],
    });

    return salasDisponiveis.map(this.formatarSala); 
  }
}
