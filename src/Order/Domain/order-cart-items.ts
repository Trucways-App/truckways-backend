import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { OrderCartEntity } from '../Infrastructure/Persistence/Relational/Entity/order-cart.entity';
import { OrderEntity } from '../Infrastructure/Persistence/Relational/Entity/order.entity';

export class CartItem {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  cartItemID: string;

  @ApiProperty({ type: String })
  @IsString()
  load_image: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  load_value: number;

  @ApiProperty({ type: String })
  @IsString()
  load_type: string;

  @ApiProperty({ type: String })
  @IsString()
  truck_type: string;

  @ApiProperty({ type: String })
  @IsString()
  load_description: string;

  @ApiProperty({ type: String })
  @IsString()
  pickup_address: string;

  @ApiProperty({ type: String })
  @IsString()
  dropoff_address: string;

  @ApiProperty({ type: String })
  @IsString()
  recipient_name: string;

  @ApiProperty({ type: String })
  @IsNumber()
  recipient_number: string;

  @ApiProperty({ type: String })
  @IsNumber()
  initial_bid_value: number;

  @ApiProperty({ type: () => OrderCartEntity })
  cart: OrderCartEntity;
}


export class Ordertem {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  orderItemID: string;

  @ApiProperty({ type: String })
  @IsString()
  load_image: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  load_value: number;

  @ApiProperty({ type: String })
  @IsString()
  load_type: string;


  @ApiProperty({ type: String })
  @IsString()
  truck_type: string;

  @ApiProperty({ type: String })
  @IsString()
  load_description: string;

  @ApiProperty({ type: String })
  @IsString()
  pickup_address: string;

  @ApiProperty({ type: String })
  @IsString()
  dropoff_address: string;

  @ApiProperty({ type: String })
  @IsString()
  recipient_name: string;

  @ApiProperty({ type: String })
  @IsNumber()
  recipient_number: string;

  @ApiProperty({ type: String })
  @IsNumber()
  initial_bid_value: number;

  @ApiProperty({ type: () => OrderEntity })
  order: OrderEntity;

  @ApiProperty()
  droppedOffAT : Date

  @ApiProperty({type:Boolean})
  isDroppedOff : boolean
}
