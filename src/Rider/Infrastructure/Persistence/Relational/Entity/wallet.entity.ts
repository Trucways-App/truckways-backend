import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RiderEntity } from "./rider.entity";

@Entity({name:'wallet'})
export class WalletEntity{
    @ApiProperty({type:Number})
    @PrimaryGeneratedColumn()
    id:number

    @ApiProperty({type:String})
    @Column({ nullable:true})
    walletAddrress:string 

    @ApiProperty({type:Number})
    @Column('decimal',{default:0.0})
    balance:number

    @ApiProperty()
    @Column({nullable:true,type:'timestamp'})
    createdAt:Date

    @ApiProperty()
    @Column({nullable:true,type:'timestamp'})
    updatedAT:Date


    @ApiPropertyOptional({type:()=>RiderEntity})
    @OneToOne(()=>RiderEntity,(rider)=>rider.my_wallet)
    @JoinColumn() 
    rider?:RiderEntity

    

    


}
