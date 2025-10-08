import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sala } from './entities/sala.entity';
import { CreateSalaDto } from './dto/create-sala.dto';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private readonly salasRepository: Repository<Sala>,
  ) {}

  async create(createSalaDto: CreateSalaDto): Promise<Sala> {
    const { codigo } = createSalaDto;

    const existingSala = await this.salasRepository.findOneBy({ codigo });

    if (existingSala) {
      throw new ConflictException(`A sala com o código '${codigo}' já existe.`);
    }

    const newSala = this.salasRepository.create(createSalaDto);
    return this.salasRepository.save(newSala);
  }
  
  findAllAtiva(): Promise<Sala[]> {
    return this.salasRepository.findBy({ isAtiva: true });
  }

  async findOne(codigo_sala: string): Promise<Sala> {
    const sala = await this.salasRepository.findOneBy({ codigo: codigo_sala });
    if (!sala) {
      throw new ConflictException(`Sala com o código '${codigo_sala}' não encontrada.`);
    }
    return sala;
  }
  async findByBloco(bloco: string): Promise<Sala[]> {
    return this.salasRepository.findBy({ bloco });
  }
  async findAll(): Promise<Sala[]> {
    return this.salasRepository.find();
  }
  async update(codigo_sala: string, updateSalaDto: Partial<CreateSalaDto>): Promise<Sala> {
    const sala = await this.findOne(codigo_sala);
    Object.assign(sala, updateSalaDto);
    return this.salasRepository.save(sala);
  }
  async remove(codigo_sala: string): Promise<Sala> {
    const sala = await this.findOne(codigo_sala);
    await this.salasRepository.remove(sala);
    return sala;
  }
}