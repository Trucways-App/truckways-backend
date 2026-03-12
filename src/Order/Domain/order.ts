import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { OrderItemsEntity } from '../Infrastructure/Persistence/Relational/Entity/order.entity';
import { BidEntity } from '../Infrastructure/Persistence/Relational/Entity/bids.entity';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';
import { OrderStatus, PaymentStatus } from 'src/Enums/order.enum';
import { RidesEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rides.entity';

export class Order {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  orderID: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  accepted_bid: number;

  @ApiProperty({ type: () => [OrderItemsEntity] })
  items: OrderItemsEntity[];

  @ApiProperty({ type: () => [BidEntity] })
  bid: BidEntity[];

  @ApiProperty({ type: () => RiderEntity })
  Rider: RiderEntity;

  @ApiProperty({ type: () => CustomerEntity })
  customer: CustomerEntity;

  @ApiProperty()
  createdAT:Date


  @ApiProperty({enum:OrderStatus})
  @IsEnum(OrderStatus)
  orderStatus:OrderStatus

  @ApiProperty({ type: String })
  @IsString()
  trackingID: string;

  @ApiProperty({ type: String })
  @IsString()
  dropoffCode: string;

  @ApiProperty({enum:PaymentStatus})
  @IsEnum(PaymentStatus)
  paymentStatus:PaymentStatus

  @ApiProperty({type:()=>RidesEntity})
  ride: RidesEntity;

}
