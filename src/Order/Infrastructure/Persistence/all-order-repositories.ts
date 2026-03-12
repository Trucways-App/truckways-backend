import { RiderBidResponse } from 'src/Order/Domain/bidResponse';
import { Bid } from 'src/Order/Domain/bids';
import { Order } from 'src/Order/Domain/order';
import { OrderCart } from 'src/Order/Domain/order-cart';
import { CartItem, Ordertem } from 'src/Order/Domain/order-cart-items';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';

export abstract class OrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract findByID(id: string): Promise<Order | null>;
  abstract findAll(dto:PaginationDto): Promise<{data:Order[],total:number}>;
  abstract findAllRelatedToCustomer(customerID:string, dto:PaginationDto):Promise<{data:Order[],total:number}>
  abstract findAllRelatedToRider(riderID:string, dto:PaginationDto):Promise<{data:Order[],total:number}>
  abstract remove(id: string): Promise<void>;
  abstract save(order: Order): Promise<Order>;
  abstract searchOrder (searchdto:SearchDto):Promise<{data:Order[], total:number}>
  abstract trackOrder (keyword:string):Promise<Order>
  abstract orderCount():Promise<number>
}

export abstract class OrderCartRepository {
  abstract create(cart: OrderCart): Promise<OrderCart>;
  abstract findByID(id: string, customerId:string): Promise<OrderCart | null>;
  abstract findByCustomer( customerId:string): Promise<OrderCart | null>;
  abstract remove(id: string): Promise<void>;
  abstract update(id: string, cart: Partial<OrderCart>): Promise<OrderCart>;
  abstract save(cart: OrderCart): Promise<OrderCart>;
}

export abstract class CartItemRepository {
  abstract create(item: CartItem): Promise<CartItem>;
  abstract findByID(id: string): Promise<CartItem | null>;
  abstract remove(id: string): Promise<void>;
  abstract update(id: string, item: Partial<CartItem>): Promise<CartItem>;
  abstract save(item: CartItem): Promise<CartItem>;
}

export abstract class OrderItemRepository {
  abstract create(item: Ordertem): Promise<Ordertem>;
  abstract findByID(id: string): Promise<Ordertem | null>;
  abstract remove(id: string): Promise<void>;
  abstract save(item: Ordertem): Promise<Ordertem>;
}

export abstract class BidRepository {
  abstract create(bid: Bid): Promise<Bid>;
  abstract findByID(id: string): Promise<Bid | null>;
  abstract findByIDForCustomer(id: string,customerId:string): Promise<Bid | null>;
  abstract fetchALLCustomer(dto:PaginationDto,customerID:string):Promise<{data:Bid[],total:number}>
  abstract fetchALLRider(dto:PaginationDto,riderID:string):Promise<{data:Bid[],total:number}>
  abstract fetchALL(dto:PaginationDto,):Promise<{data:Bid[],total:number}>
  abstract remove(id: string): Promise<void>;
  abstract update(id: number, item: Partial<Bid>): Promise<Bid>;
  abstract save(bid: Bid): Promise<Bid>;
  abstract searchBid(searchdto:SearchDto):Promise<{data:Bid[], total:number}>
  abstract bidCount():Promise<number>
}

export abstract class RiderBidResponseRepository{

  abstract create(bidResponse: RiderBidResponse): Promise<RiderBidResponse>;
  abstract findByRiderAndBid(riderId: string, bidId:string): Promise<RiderBidResponse | null>;
  abstract findAllByRider(riderid:string):Promise<RiderBidResponse[]>
  abstract find (bidid:string) :Promise<RiderBidResponse[]>
  abstract update (id: number, bidResponse: Partial<RiderBidResponse>):Promise<RiderBidResponse>;
  abstract findAllVisibleBids(riderid:string,):Promise<RiderBidResponse[]>
  abstract updateMany(criteria: any, updates: Partial<RiderBidResponse>): Promise<void>;


  
}
