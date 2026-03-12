import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsOptional, IsString } from "class-validator"


export class AddressDto {
    @IsString()
    address: string;
  }
export class updateCustomerDto{

    @ApiPropertyOptional({type:String, example:'ned'})
    @IsString()
    @IsOptional()
    name:string

    @ApiPropertyOptional({type:String, example:'+23412300000'})
    @IsString()
    @IsOptional()
    altrnatePhoneNumber:string

    @ApiPropertyOptional({type:String, example:'+23412300000'})
    @IsString()
    @IsOptional()
    phoneNumber:string

    @ApiPropertyOptional({type: AddressDto, example: '10 mohagani street nomansland, kano state'})
    @IsString()
    @IsOptional()
    address: string;

    @ApiPropertyOptional({type:String, example:'ned@example.com'})
    @IsEmail()
    @IsOptional()
    email:string




}