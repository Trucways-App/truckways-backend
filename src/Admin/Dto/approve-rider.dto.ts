import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";
import { TransformToBoolean } from "src/utils/helpers/custom-boolean-transformer";

export class AppproveRiderDto{
    @ApiProperty({type:Boolean})
    @IsNotEmpty()
    @IsBoolean()
    @TransformToBoolean()
    approve:boolean
}


export class BlockRiderDto{
    @ApiProperty({type:Boolean})
    @IsNotEmpty()
    @IsBoolean()
    @TransformToBoolean()
    block:boolean
}