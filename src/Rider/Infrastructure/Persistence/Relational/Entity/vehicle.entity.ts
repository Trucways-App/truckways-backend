import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RiderEntity } from "./rider.entity";
import { Rider } from "src/Rider/Domain/rider";

@Entity({name:'vehicle'})
export class VehicleEntity{

    @ApiProperty({type:Number})
    @PrimaryGeneratedColumn()
    id:number

    @ApiProperty({type:String})
    @Column({nullable:true})
    vehicleID:string 

    @ApiProperty({type:String})
    @Column({nullable:true})
    vehiclePicture:string 

    @ApiProperty({type:String})
    @Column({nullable:true})
    vehicleType:string

    @ApiProperty({type:String})
    @Column({nullable:true})
    plateNumber:string

    @ApiProperty({type:String})
    @Column({nullable:true})
    vehicleDocuments:string

    @ApiProperty()
    @Column({type:'timestamp', nullable:true})
    createdAT:Date

    @ApiProperty()
    @Column({type:'timestamp', nullable:true})
    updatedAT:Date

    @ApiProperty({type:()=>RiderEntity})
    @ManyToOne(()=>RiderEntity, (rider)=>rider.vehicle)
    @JoinColumn() 
    owner:RiderEntity

}