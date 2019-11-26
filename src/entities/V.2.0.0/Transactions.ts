import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    
} from "typeorm";

@Entity('Transactions')
export class Transactions {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    typeT: string;

    @Column()
    account: string;

    @Column()
    amount:number;

    @Column()
    accountts:string;

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;

    @Column({ name: "deleted_at", nullable: true })
    deletedAt: Date;
}