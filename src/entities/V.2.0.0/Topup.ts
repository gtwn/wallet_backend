import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    
} from "typeorm";

@Entity('Topup')
export class Topup {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    recode: string;

    @Column()
    amount: number;

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;

    @Column({ name: "deleted_at", nullable: true })
    deletedAt: Date;
}