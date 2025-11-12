// src/salas/dto/create-sala.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  IsBoolean, 
  IsOptional,
  IsArray,       // 👈 Importe
  ValidateNested // 👈 Importe
} from 'class-validator';
import { Type } from 'class-transformer'; // 👈 Importe
import { RecursoQuantidadeDto } from './recurso-quantidade.dto'; // 👈 Importe o novo DTO

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

  @IsString() // Ou @Matches() para o formato HH:mm
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
  ativa: boolean;

  // ... (outros campos se houver)

  // --- 👇 ADICIONE ESTE BLOCO NO FINAL DA CLASSE 👇 ---
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto dentro do array
  @Type(() => RecursoQuantidadeDto) // Converte o objeto do payload para a classe
  recursos: RecursoQuantidadeDto[];
  // --- FIM DO BLOCO ---
}