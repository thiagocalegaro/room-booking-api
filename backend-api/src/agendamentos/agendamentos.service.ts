import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository, MoreThanOrEqual } from 'typeorm';
import { addWeeks } from 'date-fns';
import { Agendamento } from './entities/agendamento.entity';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { CreateAgendamentoRecorrenteDto } from './dto/create-agendamento-recorrente.dto';
import { SalasService } from '../salas/salas.service'; // Importe os serviços
import { UsuariosService } from '../usuarios/usuarios.service';
import { Turno } from './enums/turno.enum';

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento)
    private agendamentosRepository: Repository<Agendamento>,
    private salasService: SalasService,
    private usuariosService: UsuariosService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateAgendamentoDto): Promise<Agendamento> {
    
    // 1. Traduz o turno para horas
    let hora_inicio: string;
    let hora_fim: string;
    switch (dto.turno) {
      case Turno.MANHA: hora_inicio = '08:00:00'; hora_fim = '12:00:00'; break;
      case Turno.TARDE: hora_inicio = '12:00:00'; hora_fim = '18:00:00'; break;
      case Turno.NOITE: hora_inicio = '18:00:00'; hora_fim = '23:00:00'; break;
      default: throw new BadRequestException('Turno inválido.');
    }

    const sala = await this.salasService.findOne(dto.codigo_sala);
    if (!sala) {
      throw new NotFoundException(`Sala com código ${dto.codigo_sala} não encontrada.`);
    }

    if (hora_inicio < sala.hora_inicio || hora_fim > sala.hora_fim) {
      throw new ConflictException(
        `O funcionamento desta sala é das ${sala.hora_inicio.substring(0,5)} às ${sala.hora_fim.substring(0,5)}.`
      );
    }
    
    const dataAgendamento = new Date(dto.data);
    const isDisponivel = await this.verificarDisponibilidade(
      dto.codigo_sala,
      dataAgendamento,
      hora_inicio,
      hora_fim,
    );
    if (!isDisponivel) {
      throw new ConflictException(`A sala já está ocupada neste horário.`);
    }

    // Busca o usuário
    const usuario = await this.usuariosService.findOne(dto.id_usuario);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${dto.id_usuario} não encontrado.`);
    }

    // Salva o agendamento
    const novoAgendamento = this.agendamentosRepository.create({
      data: dataAgendamento,
      sala,
      usuario,
      hora_inicio,
      hora_fim,
    });
    return this.agendamentosRepository.save(novoAgendamento);
  }

  async createRecorrente(dto: CreateAgendamentoRecorrenteDto): Promise<Agendamento[]> {
    const { codigo_sala, id_usuario, data, turno, numero_de_semanas } = dto;
    
    // Traduz o turno para horas
    let hora_inicio: string;
    let hora_fim: string;
    switch (turno) {
      case Turno.MANHA: hora_inicio = '07:00:00'; hora_fim = '12:00:00'; break;
      case Turno.TARDE: hora_inicio = '12:00:00'; hora_fim = '18:00:00'; break;
      case Turno.NOITE: hora_inicio = '18:00:00'; hora_fim = '23:00:00'; break;
      default: throw new BadRequestException('Turno inválido.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Busca as entidades fora do loop
      const sala = await this.salasService.findOne(codigo_sala);
      if (!sala) throw new NotFoundException(`Sala ${codigo_sala} não encontrada.`);
      const usuario = await this.usuariosService.findOne(id_usuario);
      if (!usuario) throw new NotFoundException(`Usuário ${id_usuario} não encontrado.`);

      if (hora_inicio < sala.hora_inicio || hora_fim > sala.hora_fim) {
        throw new ConflictException(
          `Horário indisponível. O funcionamento desta sala é das ${sala.hora_inicio.substring(0,5)} às ${sala.hora_fim.substring(0,5)}.`
        );
      }

      const agendamentosCriados: Agendamento[] = [];
      const dataInicial = new Date(data);

      // Loop para criar os agendamentos semanais
      for (let i = 0; i < numero_de_semanas; i++) {
        const dataDaSemana = addWeeks(dataInicial, i);

        // Verifica a disponibilidade (conflitos com outros)
        const isDisponivel = await this.verificarDisponibilidade(
          codigo_sala,
          dataDaSemana,
          hora_inicio,
          hora_fim,
        );
        if (!isDisponivel) {
          throw new ConflictException(`A sala já está ocupada na data ${dataDaSemana.toISOString().split('T')[0]}`);
        }

        const novoAgendamento = queryRunner.manager.create(Agendamento, {
          data: dataDaSemana,
          hora_inicio,
          hora_fim,
          sala,
          usuario,
        });
        const agendamentoSalvo = await queryRunner.manager.save(novoAgendamento);
        agendamentosCriados.push(agendamentoSalvo);
      }

      await queryRunner.commitTransaction();
      return agendamentosCriados;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async verificarDisponibilidade(
    codigo_sala: string,
    data: Date,
    hora_inicio: string,
    hora_fim: string,
  ): Promise<boolean> {
    const conflitos = await this.agendamentosRepository.count({
      where: {
        sala: { codigo: codigo_sala },
        data: data,
        hora_inicio: LessThan(hora_fim),
        hora_fim: MoreThan(hora_inicio),
      },
    });
    return conflitos === 0;
  }

 
  async findAll() {
    return this.agendamentosRepository.find({ relations: ['sala', 'usuario'],
      order: { data: 'DESC' }
     });
  }


async findMy(userId: number): Promise<Agendamento[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  return this.agendamentosRepository.find({
    where: {
      usuario: { id: userId },
      data: MoreThanOrEqual(today), 
    },
    relations: ['sala'],
    order: {
      data: 'ASC',
      hora_inicio: 'ASC',
    },
  });
}

  findOne(id: number) {
    return this.agendamentosRepository.findOne({
      where: { id },
      relations: ['sala', 'usuario'],
    });
  }

  remove(id: number) {
    return this.agendamentosRepository.delete(id);
  }

  async findHorariosDisponiveis(codigo_sala: string, data: string) {
    const agendamentos = await this.agendamentosRepository.find({
      where: {
        sala: { codigo: codigo_sala },
        data: new Date(data),
      },
      order: { hora_inicio: 'ASC' },
    });
    return agendamentos.map((a) => ({
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim,
    }));
  }
}
