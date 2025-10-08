import { IsInt, Min, ValidateNested } from 'class-validator';
import { CreateAgendamentoDto } from './create-agendamento.dto';

export class CreateAgendamentoRecorrenteDto extends CreateAgendamentoDto {
  @IsInt()
  @Min(1)
  numero_de_semanas: number;
}