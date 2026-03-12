import { OrderCartEntity } from '../Entity/order-cart.entity';
import { OrderCart } from 'src/Order/Domain/order-cart';
import { CartItemsMapper } from './cartItems.mapper';

export class OrderCartMapper {
  static toDomain(raw: OrderCartEntity): OrderCart {
    const domainEntity = new OrderCart();
    domainEntity.id = raw.id;
    domainEntity.orderCartID = raw.orderCartID;
    domainEntity.checkedOut = raw.checkedOut;
    domainEntity.LastcheckoutedAT = raw.LastcheckoutedAT;
    domainEntity.customer = raw.customer;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.items = raw.items
      ? raw.items.map((items) => CartItemsMapper.toDomain(items))
      : [];

    return domainEntity;
  }

  static toPersitence(domainEntity: OrderCart): OrderCartEntity {
    const persistenceEntity = new OrderCartEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.orderCartID = domainEntity.orderCartID;
    persistenceEntity.checkedOut = domainEntity.checkedOut;
    persistenceEntity.LastcheckoutedAT = domainEntity.LastcheckoutedAT;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.customer = domainEntity.customer;
    persistenceEntity.items = domainEntity.items
      ? domainEntity.items.map((items) => CartItemsMapper.toPeristence(items))
      : [];

    return persistenceEntity;
  }
}
