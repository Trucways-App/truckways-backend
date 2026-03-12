import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class AddressDto {
    @IsString()
    address: string;
  }
export class updateRiderProfileDto{

    @ApiPropertyOptional({type:String, example:'ned'})
    @IsString()
    @IsOptional()
    name:string

    @ApiPropertyOptional({type:String, example:'alaba'})
    @IsString()
    @IsOptional()
    city:string

    @ApiPropertyOptional({type:String, example:'Anambra'})
    @IsString()
    @IsOptional()
    state:string

    @ApiPropertyOptional({type:String, example:'+23412300000'})
    @IsString()
    @IsOptional()
    phoneNumber:string

    @ApiPropertyOptional({type: AddressDto, example: '10 mohagani street nomansland, kano state'})
    @IsString()
    @IsOptional()
    address: string;

   
    




}