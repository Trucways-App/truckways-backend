import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
export class CashoutDto {
    @ApiProperty({type:Number, example:3000})
    @IsNumber()
    amount : number

    @ApiProperty({type:String, example:'Access Bank'})
    @IsString()
    accountName:string


    @ApiProperty({type:String, example:'044'})
    @IsString()
    bankCode:string


    @ApiProperty({type:String, example:'1839579930'})
    @IsString()
    accountNumber:string
}

export class FinalizeWithdrawalDto {
    @ApiProperty({type:String, example:'000000'})
    @IsString()
    otp : string

    @ApiProperty({type:String, example:'kwwbbjdbjdwbjdwqbjdwbjdwpaystack'})
    @IsString()
    transferCode:string


}