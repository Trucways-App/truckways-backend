import { Bid } from 'src/Order/Domain/bids';
import { BidEntity } from '../Entity/bids.entity';
import { RiderBidResponseEntity } from '../Entity/bidResponse.entity';
import { RiderBidResponse } from 'src/Order/Domain/bidResponse';

export class BidResponseMapper {
  static toDomain(raw: RiderBidResponseEntity): RiderBidResponse {
    const domainEntity = new RiderBidResponse();
    domainEntity.id = raw.id;
    domainEntity.responseID = raw.responseID;
    domainEntity.status = raw.status;
    domainEntity.isVisible = raw.isVisible;
    domainEntity.respondedAt = raw.respondedAt;
    domainEntity.rider = raw.rider;
    domainEntity.bid= raw.bid;
   
    return domainEntity;
  }

  static toPeristence(domainEntity: RiderBidResponse): RiderBidResponseEntity {
    const persistenceEntity = new RiderBidResponseEntity();
    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.responseID = domainEntity.responseID;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.respondedAt = domainEntity.respondedAt;
    persistenceEntity.rider = domainEntity.rider;
    persistenceEntity.bid = domainEntity.bid;
    persistenceEntity.isVisible = domainEntity.isVisible;
   
    return persistenceEntity;
  }
}
