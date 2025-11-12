// src/salas/salas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sala } from './entities/sala.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { Recurso } from 'src/recursos/entities/recurso.entity';
import { SalaRecurso } from './entities/sala_recurso.entity';
import { DataSource, Repository, Not, In, LessThan, MoreThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Agendamento } from 'src/agendamentos/entities/agendamento.entity';
import { TipoExcecao } from 'src/excecoes/enums/tipo-excecao.enum';
import { Excecao } from '../excecoes/entities/excecoes.entity';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private salasRepository: Repository<Sala>,
    
    // Precisamos do repositório da tabela de junção
    @InjectRepository(SalaRecurso)
    private salaRecursoRepository: Repository<SalaRecurso>,

    @InjectRepository(Agendamento)
    private agendamentosRepository: Repository<Agendamento>,

    @InjectRepository(Excecao)
    private excecoesRepository: Repository<Excecao>,
    // Precisamos do DataSource para transações
    private dataSource: DataSource,
  ) {}

  // --- MÉTODO CREATE ATUALIZADO ---
  async create(createSalaDto: CreateSalaDto): Promise<Sala> {
    const { recursos, ...dadosSala } = createSalaDto;

    // Inicia uma transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Cria e salva a sala
      const novaSala = queryRunner.manager.create(Sala, dadosSala);
      await queryRunner.manager.save(novaSala);

      // 2. Se houver recursos, cria as relações
      if (recursos && recursos.length > 0) {
        for (const rec of recursos) {
          const novaRelacao = queryRunner.manager.create(SalaRecurso, {
            sala: novaSala,
            recurso: { id: rec.id } as Recurso, // Apenas o ID é necessário para a FK
            quantidade: rec.quantidade,
          });
          await queryRunner.manager.save(novaRelacao);
        }
      }

      // 3. Confirma a transação
      await queryRunner.commitTransaction();
      return novaSala;

    } catch (err) {
      // 4. Se algo der errado, desfaz tudo
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 5. Libera a conexão
      await queryRunner.release();
    }
  }

  // --- MÉTODO UPDATE ATUALIZADO ---
  async update(codigo: string, updateSalaDto: UpdateSalaDto): Promise<any> {
    const { recursos, ...dadosSala } = updateSalaDto;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Atualiza os dados da sala (ex: capacidade, tipo, etc.)
      await queryRunner.manager.update(Sala, { codigo }, dadosSala);
      
      // Carrega a sala atualizada
      const sala = await queryRunner.manager.findOneBy(Sala, { codigo });
      if (!sala) {
        throw new NotFoundException(`Sala ${codigo} não encontrada.`);
      }

      // 2. Remove TODAS as relações de recursos antigas
      await queryRunner.manager.delete(SalaRecurso, { sala: { codigo } });

      // 3. Adiciona as novas relações de recursos (apenas as com quantidade > 0)
      if (recursos && recursos.length > 0) {
        for (const rec of recursos) {
          const novaRelacao = queryRunner.manager.create(SalaRecurso, {
            sala: sala,
            recurso: { id: rec.id } as Recurso,
            quantidade: rec.quantidade,
          });
          await queryRunner.manager.save(novaRelacao);
        }
      }

      await queryRunner.commitTransaction();
      
      // Retorna a sala completa (findOne faz isso)
      return this.findOne(codigo); 

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  
  // --- MÉTODO FINDONE ATUALIZADO ---
  // Garante que o findOne retorne os recursos junto com a sala
  async findOne(codigo: string) {
    const sala = await this.salasRepository.findOne({
      where: { codigo },
      relations: [
        'salaRecursos', // Nome da propriedade na entidade Sala
        'salaRecursos.recurso', // Traz os detalhes do recurso (id, nome)
      ],
    });
    
    if (!sala) {
      throw new NotFoundException(`Sala com código ${codigo} não encontrada.`);
    }

    // Renomeia o array para 'recursos' para bater com o frontend
    // (O frontend espera `sala.recursos`, mas a entidade tem `sala.salaRecursos`)
    const { salaRecursos, ...dadosSala } = sala;
    return {
      ...dadosSala,
      recursos: salaRecursos.map(sr => ({
        recurso: sr.recurso,
        quantidade: sr.quantidade
      }))
    };
  }
  async findAll(): Promise<any[]> {
    const salas = await this.salasRepository.find({
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' } // Ordena por código
    });
    
    // Formata a resposta para o frontend
    return salas.map(this.formatarSala);
  }

  // --- NOVO MÉTODO FINDALLATIVA (PARA USUÁRIOS) ---
  // Busca apenas as salas que estão marcadas como "ativa: true"
  async findAllAtiva(): Promise<any[]> {
    const salas = await this.salasRepository.find({
      where: { isAtiva: true }, // O filtro principal
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' }
    });
    
    // Reutiliza a mesma formatação
    return salas.map(this.formatarSala);
  }

  async findByBloco(bloco: string): Promise<any[]> {
    const salas = await this.salasRepository.find({
      where: { 
        bloco: bloco, // O filtro principal pelo nome do bloco
        isAtiva: true  // Boa prática: usuários normais só devem ver salas ativas
      },
      relations: [
        'salaRecursos',
        'salaRecursos.recurso',
      ],
      order: { codigo: 'ASC' }
    });
    
    // Retorna um array vazio em vez de um erro, 
    // pois um bloco pode legitimamente não ter salas
    
    // Reutiliza a mesma formatação
    return salas.map(this.formatarSala);
  }

  // --- FUNÇÃO AUXILIAR PRIVADA ---
  // Centraliza a lógica de formatação para evitar repetição de código
  private formatarSala(sala: Sala): any {
    const { salaRecursos, ...dadosSala } = sala;
    return {
      ...dadosSala,
      recursos: salaRecursos.map(sr => ({
        // Retorna o objeto de recurso completo
        id: sr.recurso.id,
        nome: sr.recurso.nome,
        // E a quantidade
        quantidade: sr.quantidade
      }))
    };
  }

  async remove(codigo: string): Promise<void> {
    const resultado = await this.salasRepository.delete(codigo);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Sala com código ${codigo} não encontrada.`);
    }
  }

  async findAvailable(data: string, hora_inicio: string, hora_fim: string, capacidade: number): Promise<any[]> {
    
    // 1. Encontra todos os agendamentos que conflitam com o horário desejado
    const conflitos = await this.agendamentosRepository.find({
      where: {
        data: new Date(data),
        hora_inicio: LessThan(hora_fim),   // O agendamento existente começa ANTES do fim do novo
        hora_fim: MoreThan(hora_inicio), // O agendamento existente termina DEPOIS do início do novo
      },
      relations: ['sala'], // Precisamos saber a qual sala o conflito pertence
    });

    // 2. Extrai os códigos das salas que já estão ocupadas
    const salasIndisponiveisIds = conflitos.map(agendamento => agendamento.sala.codigo);

    // 3. Busca todas as salas que atendem aos critérios E NÃO ESTÃO na lista de indisponíveis
    const salasDisponiveis = await this.salasRepository.find({
      where: {
        isAtiva: true,
        capacidade: MoreThanOrEqual(capacidade || 1), // Filtra por capacidade (ou 1 se não for informado)
        hora_inicio: LessThanOrEqual(hora_inicio), // A sala abre ANTES ou NA HORA do início
        hora_fim: MoreThanOrEqual(hora_fim), // A sala fecha DEPOIS ou NA HORA do fim
        
        // Exclui as salas que encontramos no passo 2
        codigo: Not(In(salasIndisponiveisIds)),
      },
      relations: ['salaRecursos', 'salaRecursos.recurso'], // Traz os recursos
    });

    return salasDisponiveis.map(this.formatarSala); // Reutiliza sua função de formatar
  }
}
