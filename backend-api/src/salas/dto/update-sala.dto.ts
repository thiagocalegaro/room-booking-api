//udate sala dto
import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaDto } from './create-sala.dto';
export class UpdateSalaDto extends PartialType(CreateSalaDto) {
    capacidade?: number;
    bloco?: string;
    ativa?: boolean;
    foto_url?: string;
    hora_inicio?: string;
    hora_fim?: string;
    disponivel_sabado?: boolean;
    disponivel_domingo?: boolean;
}