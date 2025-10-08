import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SalaRecurso } from "../../salas/entities/sala_recurso.entity";

@Entity('recursos')
export class Recurso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: false })
    nome: string;
    
    @OneToMany(() => SalaRecurso, (salaRecurso) => salaRecurso.recurso)
    salaRecursos: SalaRecurso[];
}
