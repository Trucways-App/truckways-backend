import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class BankDto{

    @ApiPropertyOptional({type:String, example:'gtb'})
    @IsString()
    @IsOptional()
    bankName:string

    @ApiPropertyOptional({type:String, example:'12345678'})
    @IsString()
    @IsOptional()
    accountNumber:string

    @ApiPropertyOptional({type:String, example:'alaba fluffy'})
    @IsString()
    @IsOptional()
    accountName:string


}