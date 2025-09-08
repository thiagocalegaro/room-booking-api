import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty({ message: 'O campo nome não pode estar vazio.' })
    @MinLength(3)
    nome: string;
    
    @IsEmail({}, { message: 'Por favor, informe um endereço de email válido.' })
    @IsNotEmpty({ message: 'O campo email não pode estar vazio.' })
    email: string;
    
    @IsString()
    @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
    @MinLength(6)
    senha: string;
    
    @IsString()
    @IsNotEmpty()
    tipo: Role;

    @IsNotEmpty()
    @Match('senha', { message: 'As senhas não correspondem.' }) // Aplica o decorator
    confirmar_senha: string;
}
