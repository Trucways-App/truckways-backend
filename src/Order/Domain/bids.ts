import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNumber, IsNumberString, IsString } from "class-validator";
import { BidStatus, BidTypeAccepted } from "src/Enums/order.enum";
import { OrderEntity } from "../Infrastructure/Persistence/Relational/Entity/order.entity";
import { RiderEntity } from "src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity";

export class Bid {
    @ApiProperty({ type: Number })
    @IsNumber()
    id: number;
  
    @ApiProperty({ type: String })
    @IsString()
    bidID: string;
  
    @ApiProperty({ enum: BidStatus })
    @IsEnum(BidStatus)
    bidStatus: BidStatus;
  
    @ApiProperty()
    @IsDate()
    createdAT: Date;
  
    @ApiProperty({ type: Number })
    @IsNumber()
    initialBid_value: number;
  
    @ApiProperty()
    @IsDate()
    acceptedAT: Date;
  
    @ApiProperty()
    @IsDate()
    declinedAT: Date;
  
    @ApiProperty({ type: Number })
    @IsNumber()
    counteredBid_value: number;
  
    @ApiProperty()
    @IsDate()
    counteredAT: Date;
  
    @ApiProperty({ enum: BidTypeAccepted })
    @IsEnum(BidTypeAccepted)
    bidTypeAccepted:BidTypeAccepted
  
    @ApiProperty({ type: () => OrderEntity })
    order: OrderEntity;


  @ApiProperty({type:()=> RiderEntity})
  rider:RiderEntity
  }