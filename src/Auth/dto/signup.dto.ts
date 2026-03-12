import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class SignupDto{
    @ApiProperty({type:String, example:'toyeeb'})
    @IsString()
    @IsNotEmpty()
    name:string 

    @ApiProperty({type:String, example:'nedufranco@gmail.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string 

    @ApiProperty({type:String, example:'Abc123#'})
    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({minLength:6,minLowercase:1,minNumbers:1,minSymbols:1,minUppercase:1})
    password:string 

}
