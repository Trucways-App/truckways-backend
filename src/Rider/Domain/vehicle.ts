import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"
import { RiderEntity } from "../Infrastructure/Persistence/Relational/Entity/rider.entity"

export class Vehicle{

    @ApiProperty({type:Number})
    @IsNumber()
    id:number

    @ApiProperty({type:String})
    @IsString()
    vehicleID:string 

    @ApiProperty({type:String})
    @IsString()
    vehiclePicture:string 

    @ApiProperty({type:String})
    @IsString()
    vehicleType:string

    @ApiProperty({type:String})
    @IsString()
    plateNumber:string

    @ApiProperty({type:String})
    @IsString()
    vehicleDocuments:string

    @ApiProperty()
    @IsString()
    createdAT:Date

    @ApiProperty()
    @IsString()
    updatedAT:Date

    @ApiProperty({type:()=>RiderEntity})
    owner:RiderEntity

}