import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException // 1. Importe a ConflictException
} from '@nestjs/common';


@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { email, senha } = createUsuarioDto;
    const usuarioExistente = await this.usuariosRepository.findOneBy({ email });

    if (usuarioExistente) {
      throw new ConflictException(`O email '${email}' já está em uso.`);
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, saltRounds);

    const newUser = this.usuariosRepository.create({
      ...createUsuarioDto,
      senha: hashedPassword,
    });

    return this.usuariosRepository.save(newUser);
  }

  findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async login(email: string, senhaFornecida: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ email });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordMatching = await bcrypt.compare(senhaFornecida, usuario.senha);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    usuario.senha = "senha removida por segurança";
    return usuario;
  }
}
