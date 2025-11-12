import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoExcecao } from '../enums/tipo-excecao.enum';
import { ValidateIf } from 'class-validator';

export enum EscopoExcecao {
  SALA_UNICA = 'SALA_UNICA',
  BLOCO = 'BLOCO',
  TODAS = 'TODAS',
}

export class CreateExcecaoDto {
  @IsDateString(
    {},
    { message: 'data_hora_inicio deve ser uma data ISO 8601 válida' },
  )
  @IsNotEmpty()
  inicio: string;

  @IsDateString(
    {},
    { message: 'data_hora_fim deve ser uma data ISO 8601 válida' },
  )
  @IsNotEmpty()
  fim: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsEnum(TipoExcecao, { message: 'O tipo deve ser BLOQUEIO ou EXTRA' })
  @IsNotEmpty()
  tipo: TipoExcecao;

  @IsEnum(EscopoExcecao)
  @IsNotEmpty()
  escopo: EscopoExcecao;

  @ValidateIf((o) => o.escopo === EscopoExcecao.SALA_UNICA)
  @IsString()
  @IsNotEmpty()
  codigo_sala?: string;

  @ValidateIf((o) => o.escopo === EscopoExcecao.BLOCO)
  @IsString()
  @IsNotEmpty()
  bloco?: string;
}
