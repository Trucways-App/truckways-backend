import { Wallet } from 'src/Rider/Domain/wallet';
import { WalletEntity } from '../Entity/wallet.entity';
import { TransactionEntity } from '../Entity/transaction.entity';
import { Transactions } from 'src/Rider/Domain/transaction';

export class TransactionMapper {
  static toDomain(raw: TransactionEntity): Transactions {
    const domainEntity = new Transactions();
    domainEntity.id = raw.id;
    domainEntity.amount = raw.amount;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.rider = raw.rider;
    domainEntity.reference = raw.reference;
    domainEntity.walletAddrress = raw.walletAddrress;
    domainEntity.metadata = raw.metadata;
    domainEntity.description = raw.description;
    domainEntity.transactionID = raw.transactionID;
    domainEntity.type = raw.type;
    domainEntity.customer = raw.customer;
    domainEntity.status = raw.status

    return domainEntity;
  }

  static toPersistence(domainEntity: Transactions): TransactionEntity {
    const persistenceEntity = new TransactionEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
    }
    persistenceEntity.rider = domainEntity.rider;
    persistenceEntity.customer = domainEntity.customer;
    persistenceEntity.amount = domainEntity.amount;
    persistenceEntity.createdAT = domainEntity.createdAT;
    persistenceEntity.reference = domainEntity.reference;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.transactionID = domainEntity.transactionID;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.metadata = domainEntity.metadata
    persistenceEntity.walletAddrress = domainEntity.walletAddrress;

    return persistenceEntity;
  }
}