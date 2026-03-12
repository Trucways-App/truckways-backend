import { Wallet } from 'src/Rider/Domain/wallet';
import { WalletEntity } from '../Entity/wallet.entity';

export class WalletMapper {
  static toDomain(raw: WalletEntity): Wallet {
    const domainEntity = new Wallet();
    domainEntity.id = raw.id;
    domainEntity.balance = raw.balance;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.rider = raw.rider;
    domainEntity.updatedAT = raw.updatedAT;
    domainEntity.walletAddrress = raw.walletAddrress;

    return domainEntity;
  }

  static toPersistence(domainEntity: Wallet): WalletEntity {
    const persistenceEntity = new WalletEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
    }
    persistenceEntity.rider = domainEntity.rider;
    persistenceEntity.balance = domainEntity.balance;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.walletAddrress = domainEntity.walletAddrress;

    return persistenceEntity;
  }
}
