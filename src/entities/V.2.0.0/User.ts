import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany
} from 'typeorm'
import { Token } from './Token';

@Entity('user-v2')
export class User{
    static Usertype:{
        USER:'STUDENT',
        SHOP:'SHOP',
        ADMIN:'ADMIN'
    }

    static STATUS:{
        ONLINE:'ONLINE',
        OFFLINE:'OFFLINE'
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true})
    account: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    password: string;

    @Column()
    username: string;

    @Column({nullable: true})
    fristName: string;

    @Column({nullable: true})
    lastName: string;

    @Column({nullable: true})
    balance: number;
    @OneToMany(type => Token, token => token.user)
    tokens: Token[];

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;

    @Column({ name: "deleted_at", nullable: true })
    deletedAt: Date;
}