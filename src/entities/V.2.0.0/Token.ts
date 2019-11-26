import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {User} from "./User";

@Entity('tokens')
export class Token {
    static TOKEN_TYPE_AUTH_USER:string = "AUTH_USER";
    static TOKEN_TYPE_AUTH_ADMIN:string = "AUTH_ADMIN";
    static TOKEN_TYPE_ACC_CONFIRM:string = "ACC_CONFIRM";
    static TOKEN_TYPE_ACC_FORGOT:string = "ACC_FORGOT";
    static TOKEN_TYPE_ACC_VERTIFY:string = "ACC_VERTIFY";




    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    token: string;

    @Column({name: "type",nullable: true})
    type: string;

    @ManyToOne(type => User, user => user.tokens)
    user: User;

    @CreateDateColumn({type: "timestamp"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedAt: Date;

    @Column({ name: "deleted_at", nullable: true })
    deletedAt: Date;
}