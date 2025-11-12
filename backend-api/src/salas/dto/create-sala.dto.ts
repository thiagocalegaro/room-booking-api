// src/salas/dto/create-sala.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  IsBoolean, 
  IsOptional,
  IsArray,       
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecursoQuantidadeDto } from './recurso-quantidade.dto';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  bloco?: string;

  @IsInt()
  @Min(1)
  capacidade: number;

  @IsString()
  @IsNotEmpty()
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  hora_fim: string;

  @IsBoolean()
  @IsOptional()
  disponivel_sabado: boolean;

  @IsBoolean()
  @IsOptional()
  disponivel_domingo: boolean;

  @IsBoolean()
  @IsOptional()
  isAtiva: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => RecursoQuantidadeDto) 
  recursos: RecursoQuantidadeDto[];
}