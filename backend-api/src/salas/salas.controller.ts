import { Body, Controller, Get, Post, UseGuards, Param, Patch, HttpCode, HttpStatus, Delete, Query } from '@nestjs/common';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/enums/role.enum';
import { UpdateSalaDto } from './dto/update-sala.dto';


@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salasService.create(createSalaDto);
  }

  @Get('ativas')
  @UseGuards(JwtAuthGuard)
  findAllAtiva() {
    return this.salasService.findAllAtiva();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findAll(){
    return this.salasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.salasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateSalaDto: UpdateSalaDto) {
    return this.salasService.update(id, updateSalaDto);
  }

  // 👇 ENDPOINT DE DELETE 👇
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content (sucesso, sem corpo)
  remove(@Param('id') id: string) {
    return this.salasService.remove(id);
  }

  @Get('disponiveis')
  @UseGuards(JwtAuthGuard)
  findAvailable(
    @Query('data') data: string,
    @Query('hora_inicio') hora_inicio: string,
    @Query('hora_fim') hora_fim: string,
    @Query('capacidade') capacidade: number,
  ) {
    return this.salasService.findAvailable(data, hora_inicio, hora_fim, +capacidade);
  }

}
