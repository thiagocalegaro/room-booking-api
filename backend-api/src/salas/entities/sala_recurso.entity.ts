// src/recursos/entities/sala-recurso.entity.ts

import { Sala } from '../../salas/entities/sala.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Recurso } from '../../recursos/entities/recurso.entity';

@Entity('sala_recursos')
export class SalaRecurso {
  @PrimaryGeneratedColumn()
  id: number; // Uma PK simples para a relação

  @Column({ type: 'int' })
  quantidade: number;

  // --- Relacionamentos ---

  @ManyToOne(() => Sala, (sala) => sala.salaRecursos)
  @JoinColumn({ name: 'codigo_sala' }) // FK para a tabela de salas
  sala: Sala;

  @ManyToOne(() => Recurso, (recurso) => recurso.salaRecursos)
  @JoinColumn({ name: 'id_recurso' }) // FK para a tabela de recursos
  recurso: Recurso;
}