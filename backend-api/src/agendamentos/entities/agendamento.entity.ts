import { 
    Entity, 
    PrimaryGeneratedColumn, 
    ManyToOne, 
    JoinColumn, 
    Column} from "typeorm";
import { Sala } from "../../salas/entities/sala.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";


@Entity('agendamentos')
export class Agendamento {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Sala, (sala) => sala.agendamentos)
    @JoinColumn({ name: 'codigo_sala' })
    sala: Sala;

    @ManyToOne(() => Usuario, (usuario) => usuario.agendamentos)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @Column({ type: 'date', nullable: false })
    data: Date;

    @Column({ type: 'time', nullable: false })
    hora_inicio: string;

    @Column({ type: 'time', nullable: false })
    hora_fim: string;


}
