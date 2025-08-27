import { Injectable } from '@nestjs/common';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';

@Injectable()
export class AgendamentosService {
  create(createAgendamentoDto: CreateAgendamentoDto) {
    return 'This action adds a new agendamento';
  }

  findAll() {
    return `This action returns all agendamentos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agendamento`;
  }

  remove(id: number) {
    return `This action removes a #${id} agendamento`;
  }
}
