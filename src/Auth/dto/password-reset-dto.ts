import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestPasswordResetOtp{
    @ApiProperty({type:String, example:'ned@example.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string
}