import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";
import { RiderEntity } from "../Infrastructure/Persistence/Relational/Entity/rider.entity";

export class Wallet{
    @ApiProperty({type:Number})
    @IsNumber()
    id:number

    @ApiProperty({type:String})
    @IsString()
    walletAddrress:string 

    @ApiProperty({type:Number})
    @IsNumber()
    balance:number

    @ApiProperty()
    @IsDate()
    createdAt:Date

    @ApiProperty()
    @IsDate()
    updatedAT:Date

    @ApiPropertyOptional({type:()=>RiderEntity})
    rider?:RiderEntity

    


}
