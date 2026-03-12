import { ApiProperty } from "@nestjs/swagger";
import {IsEnum, IsNotEmpty, IsString } from "class-validator";
import { VerifficationType } from "src/Enums/verification.enum";

export class VerifyOtp{
    @ApiProperty({type:String, example:'000000'})
    @IsString()
    @IsNotEmpty()
    otp:string

    @ApiProperty({enum:VerifficationType})
    @IsEnum(VerifficationType)
    verificationType:VerifficationType
}