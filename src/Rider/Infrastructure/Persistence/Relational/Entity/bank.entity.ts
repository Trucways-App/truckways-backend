import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RiderEntity } from "./rider.entity";

@Entity({name:'rider-bank'})
export class BankEntity{

    @ApiProperty({type:Number})
    @PrimaryGeneratedColumn()
    id:number

    @ApiProperty({type:String})
    @Column({nullable:true})
    bankID:string 

    @ApiProperty({type:String})
    @Column({nullable:true})
    bankName:string 

    @ApiProperty({type:String})
    @Column({nullable:true})
    accountNumber:string

    @ApiProperty({type:String})
    @Column({nullable:true})
    accountName:string


    @ApiProperty()
    @Column({type:'timestamp', nullable:true})
    createdAT:Date

    @ApiProperty()
    @Column({type:'timestamp', nullable:true})
    updatedAT:Date

    @ApiProperty({type:()=>RiderEntity})
    @ManyToOne(()=>RiderEntity, (rider)=>rider.bank_details)
    @JoinColumn() 
    owner:RiderEntity

}