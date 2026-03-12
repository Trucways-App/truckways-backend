import { CartItem, Ordertem } from 'src/Order/Domain/order-cart-items';
import { CartItemsEntity } from '../Entity/order-cart-items.entity';
import { OrderItemsEntity } from '../Entity/order.entity';

export class CartItemsMapper {
  static toDomain(raw: CartItemsEntity): CartItem {
    const domainEntity = new CartItem();
    domainEntity.id = raw.id;
    domainEntity.cartItemID = raw.cartItemID;
    domainEntity.dropoff_address = raw.dropoff_address;
    domainEntity.pickup_address = raw.pickup_address;
    domainEntity.initial_bid_value = raw.initial_bid_value;
    domainEntity.load_image = raw.load_image;
    domainEntity.load_type = raw.load_type;
    domainEntity.load_value = raw.load_value;
    domainEntity.recipient_name = raw.recipient_name;
    domainEntity.recipient_number = raw.recipient_number;
    domainEntity.truck_type = raw.truck_type;
    domainEntity.load_description = raw.load_description;
    domainEntity.cart = raw.cart;
    return domainEntity;
  }

  static toPeristence(domainEntity: CartItem): CartItemsEntity {
    const persistenceEntity = new CartItemsEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.cartItemID = domainEntity.cartItemID;
    persistenceEntity.cart = domainEntity.cart;
    persistenceEntity.dropoff_address = domainEntity.dropoff_address;
    persistenceEntity.pickup_address = domainEntity.pickup_address;
    persistenceEntity.load_image = domainEntity.load_image;
    persistenceEntity.load_type = domainEntity.load_type;
    persistenceEntity.load_value = domainEntity.load_value;
    persistenceEntity.recipient_name = domainEntity.recipient_name;
    persistenceEntity.recipient_number = domainEntity.recipient_number;
    persistenceEntity.truck_type = domainEntity.truck_type;
    persistenceEntity.load_description = domainEntity.load_description;
    persistenceEntity.initial_bid_value = domainEntity.initial_bid_value;
    return persistenceEntity;
  }
}

export class OrderItemsMapper {
  static toDomain(raw: OrderItemsEntity): Ordertem {
    const domainEntity = new Ordertem();
    domainEntity.id = raw.id;
    domainEntity.orderItemID = raw.orderItemID;
    domainEntity.dropoff_address = raw.dropoff_address;
    domainEntity.pickup_address = raw.pickup_address;
    domainEntity.initial_bid_value = raw.initial_bid_value;
    domainEntity.load_image = raw.load_image;
    domainEntity.load_type = raw.load_type;
    domainEntity.load_value = raw.load_value;
    domainEntity.load_description = raw.load_description;
    domainEntity.recipient_name = raw.recipient_name;
    domainEntity.recipient_number = raw.recipient_number;
    domainEntity.truck_type = raw.truck_type;
    domainEntity.order = raw.order;
    domainEntity.isDroppedOff = raw.isDroppedOff;
    domainEntity.droppedOffAT = raw.droppedOffAT
    return domainEntity;
  }

  static toPeristence(domainEntity: Ordertem): OrderItemsEntity {
    const persistenceEntity = new OrderItemsEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.orderItemID = domainEntity.orderItemID;
    persistenceEntity.order = domainEntity.order;
    persistenceEntity.dropoff_address = domainEntity.dropoff_address;
    persistenceEntity.pickup_address = domainEntity.pickup_address;
    persistenceEntity.load_image = domainEntity.load_image;
    persistenceEntity.load_type = domainEntity.load_type;
    persistenceEntity.load_description = domainEntity.load_description;
    persistenceEntity.load_value = domainEntity.load_value;
    persistenceEntity.recipient_name = domainEntity.recipient_name;
    persistenceEntity.recipient_number = domainEntity.recipient_number;
    persistenceEntity.truck_type = domainEntity.truck_type;
    persistenceEntity.initial_bid_value = domainEntity.initial_bid_value;
    persistenceEntity.isDroppedOff = domainEntity.isDroppedOff;
    persistenceEntity.droppedOffAT = domainEntity.droppedOffAT
    return persistenceEntity;
  }
}
