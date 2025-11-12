// src/agendamentos/dto/create-agendamento-recorrente.dto.ts
import { IsDate, IsEnum, IsNotEmpty, IsInt, IsString, Min } from 'class-validator';
import { Turno } from '../enums/turno.enum';
import { Type } from 'class-transformer';

export class CreateAgendamentoRecorrenteDto {
  @IsString()
  @IsNotEmpty()
  codigo_sala: string;

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  data: Date; // A data de início (primeiro agendamento)

  @IsEnum(Turno)
  @IsNotEmpty()
  turno: Turno;

  @IsInt()
  @Min(2) // Deve ser pelo menos 2 semanas para ser "recorrente"
  numero_de_semanas: number;
}