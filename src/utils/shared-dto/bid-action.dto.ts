import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import { TransformToBoolean } from "src/utils/helpers/custom-boolean-transformer";

export class BidActionDto{
    @ApiProperty({type:Boolean})
    @IsBoolean()
    @TransformToBoolean()
    doYouAccept:boolean
}

export class CounterBidDto{
    @ApiProperty({type:Number})
    @IsNumber()
    @IsNotEmpty()
    counterOffer:number
}