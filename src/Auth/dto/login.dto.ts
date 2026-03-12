import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class LoginDto{
    @ApiProperty({type:String, example:'nedufranco@gmail.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string

    @ApiProperty({type:String, example:'Abc123#'})
    @IsString()
    @IsNotEmpty()
    password:string

}