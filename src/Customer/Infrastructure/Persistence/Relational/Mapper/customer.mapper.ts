import { Customer } from 'src/Customer/Domain/customer';
import { CustomerEntity } from '../Entity/customer.entity';
import { OrderMapper } from 'src/Order/Infrastructure/Persistence/Relational/Mapper/order.mapper';
import { TransactionMapper } from 'src/Rider/Infrastructure/Persistence/Relational/Mapper/transaction.mapper';

export class CustomerMapper {
  static toDomain(raw: CustomerEntity): Customer {
    const domainEntity = new Customer();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.deviceToken = raw.deviceToken;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.altrnatePhoneNumber = raw.altrnatePhoneNumber;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.profilePicture = raw.profilePicture;
    domainEntity.resetPasswordToken = raw.resetPasswordToken;
    domainEntity.resetPasswordTokenExpTime = raw.resetPasswordTokenExpTime;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.updatedAT = raw.updatedAT;
    domainEntity.customerID = raw.customerID;
    domainEntity.isVerified = raw.isVerified;
    domainEntity.role = raw.role;
    domainEntity.my_cart = raw.my_cart;
    domainEntity.my_orders = raw.my_orders ? raw.my_orders.map((order)=>OrderMapper.toDomain(order)):[];
    domainEntity.my_transaction = raw.my_transaction ? raw.my_transaction.map((order)=>TransactionMapper.toDomain(order)):[]
    return domainEntity;
  }

  static toPerisitence(domainEntity: Customer): CustomerEntity {
    const persistenceEntity = new CustomerEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.deviceToken = domainEntity.deviceToken;
    persistenceEntity.customerID = domainEntity.customerID;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.altrnatePhoneNumber = domainEntity.altrnatePhoneNumber;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.isVerified = domainEntity.isVerified;
    persistenceEntity.profilePicture = domainEntity.profilePicture;
    persistenceEntity.resetPasswordToken = domainEntity.resetPasswordToken;
    persistenceEntity.resetPasswordTokenExpTime =
      domainEntity.resetPasswordTokenExpTime;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.createdAT = domainEntity.createdAT;
    persistenceEntity.my_cart = domainEntity.my_cart;
    persistenceEntity.my_orders = domainEntity.my_orders ? domainEntity.my_orders.map((order)=>OrderMapper.toPersistence(order)): []
    persistenceEntity.my_transaction = domainEntity.my_transaction ? domainEntity.my_transaction.map((order)=>TransactionMapper.toPersistence(order)): []
    return persistenceEntity;
  }
}
