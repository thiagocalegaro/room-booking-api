import { IsString, IsNotEmpty, IsInt, MinLength, IsBoolean, Min, IsOptional } from 'class-validator';

export class CreateSalaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    codigo: string;

    @IsInt({message: 'A capacidade deve ser um número inteiro.' })
    @IsNotEmpty({ message: 'O campo capacidade não pode estar vazio.' })
    @Min(1, { message: 'A capacidade deve ser pelo menos 1.' })
    capacidade: number;

    @IsString()
    @IsOptional()
    bloco?: string;

    @IsBoolean()
    @IsOptional()
    ativa?: boolean;
    
    @IsString()
    @IsOptional()
    foto_url?: string;

    @IsString()
    @IsOptional()
    hora_inicio: string;

    @IsString()
    @IsOptional()
    hora_fim: string;

    @IsBoolean()
    @IsOptional()
    disponivel_sabado?: boolean;
    
    @IsBoolean()
    @IsOptional()
    disponivel_domingo?: boolean;
}