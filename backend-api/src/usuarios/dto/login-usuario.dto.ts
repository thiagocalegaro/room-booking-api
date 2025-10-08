import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUsuarioDto {
  @IsEmail({}, { message: 'Por favor, informe um endereço de email válido.' })
  @IsNotEmpty({ message: 'O campo email não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
  senha: string;
}