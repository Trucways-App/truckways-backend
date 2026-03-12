import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResendExpiredOtp{
    @ApiProperty({type:String, example:'ned@example.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string
}