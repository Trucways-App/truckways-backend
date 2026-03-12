import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class VehicleDto{

    @ApiPropertyOptional({type:String, example:'ned'})
    @IsString()
    @IsOptional()
    vehicleType:string

    @ApiPropertyOptional({type:String, example:'alaba'})
    @IsString()
    @IsOptional()
    plateNumber:string
}