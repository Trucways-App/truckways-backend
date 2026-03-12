import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class devicetokenDto{
  

    @ApiProperty({type:String, example:'ksffjfjkjfkkf;laddkbdkbdlkddalkddlkd'})
    @IsString()
    @IsNotEmpty()
    deviceToken:string

}