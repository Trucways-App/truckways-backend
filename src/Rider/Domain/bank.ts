import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsNumber, IsString } from "class-validator"
import { RiderEntity } from "../Infrastructure/Persistence/Relational/Entity/rider.entity"

export class Bank{

    @ApiProperty({type:Number})
    @IsNumber()
    id:number

    @ApiProperty({type:String})
    @IsString()
    bankID:string 

    @ApiProperty({type:String})
    @IsString()
    bankName:string 

    @ApiProperty({type:String})
    @IsString()
    accountNumber:string

    @ApiProperty({type:String})
    @IsString()
    accountName:string


    @ApiProperty()
    @IsDate()
    createdAT:Date

    @ApiProperty()
    @IsDate()
    updatedAT:Date

    @ApiProperty({type:()=>RiderEntity})
    owner:RiderEntity
}