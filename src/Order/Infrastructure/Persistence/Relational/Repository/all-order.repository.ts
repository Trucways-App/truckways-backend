import { InjectRepository } from '@nestjs/typeorm';
import {
  BidRepository,
  CartItemRepository,
  OrderCartRepository,
  OrderItemRepository,
  OrderRepository,
  RiderBidResponseRepository,
} from '../../all-order-repositories';
import { OrderEntity, OrderItemsEntity } from '../Entity/order.entity';
import { ILike, Repository } from 'typeorm';
import { Order } from 'src/Order/Domain/order';
import { OrderMapper } from '../Mapper/order.mapper';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';
import { OrderCart } from 'src/Order/Domain/order-cart';
import { OrderCartEntity } from '../Entity/order-cart.entity';
import { OrderCartMapper } from '../Mapper/order-cart.mapper';
import { CartItemsEntity } from '../Entity/order-cart-items.entity';
import { CartItem, Ordertem } from 'src/Order/Domain/order-cart-items';
import { CartItemsMapper, OrderItemsMapper } from '../Mapper/cartItems.mapper';
import { BidEntity } from '../Entity/bids.entity';
import { Bid } from 'src/Order/Domain/bids';
import { BidMapper } from '../Mapper/bids.mapper';
import { RiderBidResponse } from 'src/Order/Domain/bidResponse';
import { BidResponseMapper } from '../Mapper/bidResponse.mapper';
import { RiderBidResponseEntity } from '../Entity/bidResponse.entity';

export class OrderRelationalRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private orderEntityRepository: Repository<OrderEntity>,
  ) {}

  async create(order: Order): Promise<Order> {
    const persistenceOrder = OrderMapper.toPersistence(order);
    const savedOrder = await this.orderEntityRepository.save(persistenceOrder);
    return OrderMapper.toDomain(savedOrder);
  }

  async findByID(id: string): Promise<Order> {
    const order = await this.orderEntityRepository.findOne({
      where: { orderID: id },
      relations: ['customer', 'bid', 'items', 'Rider'],
    });
    return order ? OrderMapper.toDomain(order) : null;
  }

  async findAll(dto: PaginationDto): Promise<{ data: Order[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.orderEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['customer', 'bid', 'Rider', 'Rider.vehicle', 'items'],
    });
    const orders = result.map(OrderMapper.toDomain);
    return { data: orders, total };
  }

  async findAllRelatedToCustomer(
    customerID: string,
    dto: PaginationDto,
  ): Promise<{ data: Order[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.orderEntityRepository.findAndCount({
      where: { customer: { customerID: customerID } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['customer', 'bid', 'Rider', 'Rider.vehicle', 'items'],
    });
    const orders = result.map(OrderMapper.toDomain);
    return { data: orders, total };
  }

  async findAllRelatedToRider(
    riderID: string,
    dto: PaginationDto,
  ): Promise<{ data: Order[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.orderEntityRepository.findAndCount({
      where: { Rider: { riderID: riderID } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['customer', 'bid', 'Rider', 'Rider.vehicle', 'items'],
    });
    const orders = result.map(OrderMapper.toDomain);
    return { data: orders, total };
  }

  async save(order: Order): Promise<Order> {
    const persistenceOrder = OrderMapper.toPersistence(order);
    const savedOrder = await this.orderEntityRepository.save(persistenceOrder, {
      reload: true,
    });

    return OrderMapper.toDomain(savedOrder);
  }

  async remove(id: string): Promise<void> {
    await this.orderEntityRepository.delete(id);
  }

  async searchOrder(
    searchDto: SearchDto,
  ): Promise<{ data: Order[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.orderEntityRepository.createQueryBuilder('order');

    if (keyword) {
      qb.where('order.orderID ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    // Sorting
    qb.orderBy(`order.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [orders, total] = await qb.getManyAndCount();

    return { data: orders, total };
  }

  async trackOrder(keyword: string): Promise<Order> {
    const order = await this.orderEntityRepository.findOne({
      where: { trackingID: keyword },
      relations: ['ride', 'Rider', 'Rider.vehicle'],
    });

    return order ? OrderMapper.toDomain(order) : null;
  }

  async orderCount():Promise<number>{
    return await this.orderEntityRepository.count()
  }
}

///order cart

export class OrderCartRelationalRepository implements OrderCartRepository {
  constructor(
    @InjectRepository(OrderCartEntity)
    private orderCartEntityRepository: Repository<OrderCartEntity>,
  ) {}

  async create(cart: OrderCart): Promise<OrderCart> {
    const persistenceCart = OrderCartMapper.toPersitence(cart);
    const savedCart =
      await this.orderCartEntityRepository.save(persistenceCart);
    return OrderCartMapper.toDomain(savedCart);
  }

  async findByID(id: string, customerid: string): Promise<OrderCart> {
    const cart = await this.orderCartEntityRepository.findOne({
      where: { orderCartID: id, customer: { customerID: customerid } },
      relations: ['items'],
    });
    return cart ? OrderCartMapper.toDomain(cart) : null;
  }

  async findByCustomer(customerid: string): Promise<OrderCart> {
    const cart = await this.orderCartEntityRepository.findOne({
      where: { customer: { customerID: customerid } },
      relations: ['items'],
    });
    return cart ? OrderCartMapper.toDomain(cart) : null;
  }

  async save(cart: OrderCart): Promise<OrderCart> {
    const persistenceOrder = OrderCartMapper.toPersitence(cart);
    const savedCart = await this.orderCartEntityRepository.save(
      persistenceOrder,
      {
        reload: true,
      },
    );

    return OrderCartMapper.toDomain(savedCart);
  }

  async update(id: string, cart: Partial<OrderCart>): Promise<OrderCart> {
    await this.orderCartEntityRepository.update(
      id,
      OrderCartMapper.toPersitence(cart as OrderCart),
    );
    const updatedCart = await this.orderCartEntityRepository.findOne({
      where: { orderCartID: id },
    });
    return OrderCartMapper.toDomain(updatedCart);
  }

  async remove(id: string): Promise<void> {
    await this.orderCartEntityRepository.delete(id);
  }
}

/// cart item
export class CartItemsRelationalRepository implements CartItemRepository {
  constructor(
    @InjectRepository(CartItemsEntity)
    private cartItemEntityRepository: Repository<CartItemsEntity>,
  ) {}

  async create(item: CartItem): Promise<CartItem> {
    const persistenceItem = CartItemsMapper.toPeristence(item);
    const savedItem = await this.cartItemEntityRepository.save(persistenceItem);
    return CartItemsMapper.toDomain(savedItem);
  }

  async findByID(id: string): Promise<CartItem> {
    const item = await this.cartItemEntityRepository.findOne({
      where: { cartItemID: id },
    });
    return item ? CartItemsMapper.toDomain(item) : null;
  }

  async save(item: CartItem): Promise<CartItem> {
    const persistenceItem = CartItemsMapper.toPeristence(item);
    const savedItem = await this.cartItemEntityRepository.save(
      persistenceItem,
      {
        reload: true,
      },
    );

    return CartItemsMapper.toDomain(savedItem);
  }

  async remove(id: string): Promise<void> {
    await this.cartItemEntityRepository.delete(id);
  }

  async update(id: string, item: Partial<CartItem>): Promise<CartItem> {
    await this.cartItemEntityRepository.update(
      id,
      CartItemsMapper.toPeristence(item as CartItem),
    );
    const updatedItem = await this.cartItemEntityRepository.findOne({
      where: { cartItemID: id },
    });
    return CartItemsMapper.toDomain(updatedItem);
  }
}

//ordder Items
export class OrderItemsRelationalRepository implements OrderItemRepository {
  constructor(
    @InjectRepository(OrderItemsEntity)
    private orderItemEntityRepository: Repository<OrderItemsEntity>,
  ) {}

  async create(item: Ordertem): Promise<Ordertem> {
    const persistenceItem = OrderItemsMapper.toPeristence(item);
    const savedItem =
      await this.orderItemEntityRepository.save(persistenceItem);
    return OrderItemsMapper.toDomain(savedItem);
  }

  async findByID(id: string): Promise<Ordertem> {
    const item = await this.orderItemEntityRepository.findOne({
      where: { orderItemID: id },
    });
    return item ? OrderItemsMapper.toDomain(item) : null;
  }

  async save(item: Ordertem): Promise<Ordertem> {
    const persistenceItem = OrderItemsMapper.toPeristence(item);
    const savedItem = await this.orderItemEntityRepository.save(
      persistenceItem,
      {
        reload: true,
      },
    );

    return OrderItemsMapper.toDomain(savedItem);
  }

  async remove(id: string): Promise<void> {
    await this.orderItemEntityRepository.delete(id);
  }
}

// bids
export class BidsRelationalRepository implements BidRepository {
  constructor(
    @InjectRepository(BidEntity)
    private bidEntityRepository: Repository<BidEntity>,
  ) {}

  async create(bid: Bid): Promise<Bid> {
    const persistenceBid = BidMapper.toPeristence(bid);
    const savedBid = await this.bidEntityRepository.save(persistenceBid);
    return BidMapper.toDomain(savedBid);
  }

  async findByID(id: string): Promise<Bid | null> {
    const bid = await this.bidEntityRepository.findOne({
      where: { bidID: id },
      relations: ['order', 'order.customer', 'rider'],
    });
    return bid ? BidMapper.toDomain(bid) : null;
  }

  async findByIDForCustomer(
    id: string,
    customerId: string,
  ): Promise<Bid | null> {
    const bid = await this.bidEntityRepository.findOne({
      where: { bidID: id, order: { customer: { customerID: customerId } } },
      relations: ['order', 'order.customer', 'rider', 'rider.vehicle'],
    });
    return bid ? BidMapper.toDomain(bid) : null;
  }

  async fetchALLCustomer(
    dto: PaginationDto,
    customerId: string,
  ): Promise<{ data: Bid[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.bidEntityRepository.findAndCount({
      where: { order: { customer: { customerID: customerId } } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['order', 'order.customer', 'rider', 'rider.vehicle'],
    });
    const bids = result.map(BidMapper.toDomain);
    return { data: bids, total };
  }

  async fetchALLRider(
    dto: PaginationDto,
    riderId: string,
  ): Promise<{ data: Bid[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.bidEntityRepository.findAndCount({
      where: { rider: { riderID: riderId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['order', 'order.customer', 'rider'],
    });
    const bids = result.map(BidMapper.toDomain);
    return { data: bids, total };
  }

  //return  back to this soon

  async fetchALL(dto: PaginationDto): Promise<{ data: Bid[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.bidEntityRepository.findAndCount({
      //where: { order: { customer: { customerID: customerId } } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['order', 'order.customer', 'rider'],
    });
    const bids = result.map(BidMapper.toDomain);
    return { data: bids, total };
  }

  async save(bid: Bid): Promise<Bid> {
    const persistenceBid = BidMapper.toPeristence(bid);
    const savedBid = await this.bidEntityRepository.save(persistenceBid, {
      reload: true,
    });

    return BidMapper.toDomain(savedBid);
  }

  async remove(id: string): Promise<void> {
    await this.bidEntityRepository.delete(id);
  }

  async update(id: number, bid: Partial<Bid>): Promise<Bid> {
    await this.bidEntityRepository.update(
      id,
      BidMapper.toPeristence(bid as Bid),
    );
    const updatedBid = await this.bidEntityRepository.findOne({
      where: { id: id },
      relations: ['rider', 'rider.vehicle'],
    });
    return BidMapper.toDomain(updatedBid);
  }

  async searchBid(
    searchDto: SearchDto,
  ): Promise<{ data: Bid[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.bidEntityRepository.createQueryBuilder('bid');

    if (keyword) {
      qb.where('bid.orderID ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    // Sorting
    qb.orderBy(`bid.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [orders, total] = await qb.getManyAndCount();

    return { data: orders, total };
  }

  async bidCount():Promise<number>{
    return await this.bidEntityRepository.count()
  }
}

export class RiderBidResponseRelationalRepository
  implements RiderBidResponseRepository
{
  constructor(
    @InjectRepository(RiderBidResponseEntity)
    private bidResponseEntityRepository: Repository<RiderBidResponseEntity>,
  ) {}

  async create(response: RiderBidResponse): Promise<RiderBidResponse> {
    const persistenceBid = BidResponseMapper.toPeristence(response);
    const savedBid =
      await this.bidResponseEntityRepository.save(persistenceBid);
    return BidResponseMapper.toDomain(savedBid);
  }

  async findByRiderAndBid(
    riderId: string,
    bidId: string,
  ): Promise<RiderBidResponse | null> {
    const bid = await this.bidResponseEntityRepository.findOne({
      where: { rider: { riderID: riderId }, bid: { bidID: bidId } },
    });
    return bid ? BidResponseMapper.toDomain(bid) : null;
  }

  async findAllByRider(riderid: string): Promise<RiderBidResponse[]> {
    const result = await this.bidResponseEntityRepository.find({
      where: { rider: { riderID: riderid } },
      relations: ['bid', 'bid.order'],
    });
    const bids = result.map(BidResponseMapper.toDomain);
    return bids;
  }

  async findAllVisibleBids(riderid: string): Promise<RiderBidResponse[]> {
    const result = await this.bidResponseEntityRepository.find({
      where: { rider: { riderID: riderid },isVisible:true },
      relations: ['bid', 'bid.order'],
    });
    const bids = result.map(BidResponseMapper.toDomain);
    return bids;
  }

  async find(bidID:string): Promise<RiderBidResponse[]> {
    const result = await this.bidResponseEntityRepository.find({
      where: { bid:{bidID:bidID}},
      relations: ['bid', 'bid.order', 'rider'],
    });
    const bids = result.map(BidResponseMapper.toDomain);
    return bids;
  }

  async update(id: number, bid: Partial<RiderBidResponse>): Promise<RiderBidResponse> {
    await this.bidResponseEntityRepository.update(
      id,
      BidResponseMapper.toPeristence(bid as RiderBidResponse),
    );
    const updatedBid = await this.bidResponseEntityRepository.findOne({
      where: { id: id },
      relations: ['rider', 'bid','bid.order'],
    });
    return BidResponseMapper.toDomain(updatedBid);
  }

  async updateMany(
  criteria: any, 
  updates: Partial<RiderBidResponse>
): Promise<void> {
  await this.bidResponseEntityRepository.update(
    criteria,
    BidResponseMapper.toPeristence(updates as RiderBidResponse)
  );
}
}
