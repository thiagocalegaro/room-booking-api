import { IsDate, IsDateString, IsInt, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateAgendamentoDto {
    @IsString()
    @IsNotEmpty()
    codigo_sala: string;

    @IsInt()
    @IsNotEmpty()
    id_usuario: number;

    @IsDate()
    @IsNotEmpty()
    data: Date;
    
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'A hora de início deve estar no formato HH:mm.',
  })
    @IsNotEmpty()
    hora_inicio: string;
    
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'A hora de início deve estar no formato HH:mm.',
  })
    @IsNotEmpty()
    hora_fim: string;
}
