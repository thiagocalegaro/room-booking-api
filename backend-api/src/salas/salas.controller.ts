import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/enums/role.enum';

@Controller('salas')
export class SalasController {
    constructor(private readonly salasService: SalasService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    create(@Body() createSalaDto : CreateSalaDto) {
        return this.salasService.create(createSalaDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAllAtiva() {
        return this.salasService.findAllAtiva();
    }
}
