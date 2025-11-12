import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/enums/role.enum';
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  findAll() {
    return this.usuariosService.findAll();
  }
}
