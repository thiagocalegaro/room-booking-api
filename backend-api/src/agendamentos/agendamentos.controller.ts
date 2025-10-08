import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { CreateAgendamentoRecorrenteDto } from './dto/create-agendamento-recorrente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/enums/role.enum';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.agendamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(+id);
  }

  @Post('recorrente')
  createRecorrente(@Body() createAgendamentoRecorrenteDto: CreateAgendamentoRecorrenteDto) {
    return this.agendamentosService.createRecorrente(createAgendamentoRecorrenteDto);
  }
}
