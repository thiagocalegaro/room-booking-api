import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RecursosService } from './recursos.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { UpdateRecursoDto } from './dto/update-recurso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { Role } from '../usuarios/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guards';

@Controller('recursos')
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createRecursoDto: CreateRecursoDto) {
    return this.recursosService.create(createRecursoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.recursosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.recursosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateRecursoDto: UpdateRecursoDto) {
    return this.recursosService.update(+id, updateRecursoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.recursosService.remove(+id);
  }
}
