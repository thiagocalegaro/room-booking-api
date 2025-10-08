
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Excecao } from '../../excecoes/entities/excecoes.entity';
import { Agendamento } from '../../agendamentos/entities/agendamento.entity';
import { SalaRecurso } from './sala_recurso.entity';

@Entity('salas')
export class Sala {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  codigo: string; 

  @Column({ type: 'text', nullable: false })
  tipo: string;

  @Column({ type: 'int', nullable: false})
  capacidade: number;
  
  @Column({ type: 'text', nullable: true })
  bloco: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  isAtiva: boolean;

  @Column({ type: 'text', nullable: true })
  foto_url: string;

  @Column({ type: 'time', nullable: true, default: '08:00:00' })
  hora_inicio: string;

  @Column({ type: 'time', nullable: true, default: '18:00:00' })
  hora_fim: string;

  @Column({ type: 'boolean', nullable: true ,default: false })
  disponivel_sabado: boolean;

  @Column({ type: 'boolean', nullable: true ,default: false })
  disponivel_domingo: boolean;

  @OneToMany(() => Excecao, (excecao) => excecao.sala)
  excecoes: Excecao[];

  @OneToMany(() => Agendamento, (agendamento) => agendamento.sala)
  agendamentos: Agendamento[];

  @OneToMany(() => SalaRecurso, (salaRecurso) => salaRecurso.sala)
  salaRecursos: SalaRecurso[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}