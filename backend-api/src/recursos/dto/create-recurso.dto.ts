import { IsNotEmpty, IsString } from "class-validator";

export class CreateRecursoDto {
    @IsString()
    @IsNotEmpty({ message: 'O campo nome não pode estar vazio.' })
    nome: string;
}
