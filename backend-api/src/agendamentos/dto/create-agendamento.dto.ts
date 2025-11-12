import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  IsEnum,
} from 'class-validator';
import { Turno } from '../enums/turno.enum';
import { Type } from 'class-transformer';


export class CreateAgendamentoDto {
  @IsString()
  @IsNotEmpty()
  codigo_sala: string;

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  data: Date;

  @IsEnum(Turno)
  @IsNotEmpty()
  turno: Turno;
}
