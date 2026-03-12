import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidEntity } from './Entity/bids.entity';
import { OrderEntity, OrderItemsEntity } from './Entity/order.entity';
import { CartItemsEntity } from './Entity/order-cart-items.entity';
import { OrderCartEntity } from './Entity/order-cart.entity';
import {
  BidRepository,
  CartItemRepository,
  OrderCartRepository,
  OrderItemRepository,
  OrderRepository,
  RiderBidResponseRepository,
} from '../all-order-repositories';
import {
  BidsRelationalRepository,
  CartItemsRelationalRepository,
  OrderCartRelationalRepository,
  OrderItemsRelationalRepository,
  OrderRelationalRepository,
  RiderBidResponseRelationalRepository,
} from './Repository/all-order.repository';
import { RiderBidResponseEntity } from './Entity/bidResponse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      OrderEntity,
      OrderItemsEntity,
      CartItemsEntity,
      OrderCartEntity,
      RiderBidResponseEntity
    ]),
  ],
  providers: [
    {
      provide: BidRepository,
      useClass: BidsRelationalRepository,
    },
    {
      provide: OrderRepository,
      useClass: OrderRelationalRepository,
    },
    {
      provide: OrderItemRepository,
      useClass: OrderItemsRelationalRepository,
    },
    {
      provide: CartItemRepository,
      useClass: CartItemsRelationalRepository,
    },
    {
      provide: OrderCartRepository,
      useClass: OrderCartRelationalRepository,
    },
    {
      provide:RiderBidResponseRepository,
      useClass:RiderBidResponseRelationalRepository
    }
  ],
  exports:[OrderRepository,OrderItemRepository,OrderCartRepository,CartItemRepository,BidRepository,RiderBidResponseRepository]
})
export class PersitenceRelationalOrderModule {}
