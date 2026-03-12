import { Bid } from 'src/Order/Domain/bids';
import { BidEntity } from '../Entity/bids.entity';

export class BidMapper {
  static toDomain(raw: BidEntity): Bid {
    const domainEntity = new Bid();
    domainEntity.id = raw.id;
    domainEntity.bidID = raw.bidID;
    domainEntity.bidStatus = raw.bidStatus;
    domainEntity.bidTypeAccepted = raw.bidTypeAccepted;
    domainEntity.counteredAT = raw.counteredAT;
    domainEntity.counteredBid_value = raw.counteredBid_value;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.declinedAT = raw.declinedAT;
    domainEntity.acceptedAT = raw.acceptedAT;
    domainEntity.order = raw.order;
    domainEntity.rider = raw.rider;
    domainEntity.initialBid_value = raw.initialBid_value;
    return domainEntity;
  }

  static toPeristence(domainEntity: Bid): BidEntity {
    const persistenceEntity = new BidEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.bidID = domainEntity.bidID;
    persistenceEntity.bidStatus = domainEntity.bidStatus;
    persistenceEntity.bidTypeAccepted = domainEntity.bidTypeAccepted;
    persistenceEntity.acceptedAT = domainEntity.acceptedAT;
    persistenceEntity.counteredAT = domainEntity.counteredAT;
    persistenceEntity.counteredBid_value = domainEntity.counteredBid_value;
    persistenceEntity.createdAT = domainEntity.createdAT;
    persistenceEntity.declinedAT = domainEntity.declinedAT;
    persistenceEntity.initialBid_value = domainEntity.initialBid_value;
    persistenceEntity.order = domainEntity.order;
    persistenceEntity.rider = domainEntity.rider
    return persistenceEntity;
  }
}
