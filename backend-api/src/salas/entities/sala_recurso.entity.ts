// src/recursos/entities/sala-recurso.entity.ts

import { Sala } from '../../salas/entities/sala.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recurso } from '../../recursos/entities/recurso.entity';

@Entity('sala_recursos')
export class SalaRecurso {
  @PrimaryGeneratedColumn()
  id: number; // Uma PK simples para a relação

  @Column({ type: 'int' })
  quantidade: number;

  // --- Relacionamentos ---

  @ManyToOne(() => Sala, (sala) => sala.salaRecursos, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'codigo_sala' })
  sala: Sala;

  @ManyToOne(() => Recurso, (recurso) => recurso.salaRecursos, {
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'id_recurso' })
  recurso: Recurso;
}
