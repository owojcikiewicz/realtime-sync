import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Input {
    @PrimaryGeneratedColumn("increment")
    uid: number;

    @Column()
    website: string; 

    @Column()
    type: string; 

    @Column()
    id: string; 

    @Column()
    value: string; 
};