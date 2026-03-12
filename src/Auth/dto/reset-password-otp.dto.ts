import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { Match } from "src/utils/helpers/custom-match-decorator";

export class ResetPasswordDto{
    @ApiProperty({type:String, example:'Abc#12'})
    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({minLength:6,minLowercase:1,minNumbers:1,minSymbols:1,minUppercase:1})
    password:string

    @ApiProperty({type:String, example:'Abc#12'})
    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'confirmPassword does not match the new password.' })
    confirmPassword:string

    @ApiProperty({type:String, example:'ned@example.com'})
    @IsEmail()
    @IsNotEmpty()
    email:string



}