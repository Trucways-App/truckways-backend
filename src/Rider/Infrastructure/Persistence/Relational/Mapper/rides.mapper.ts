
import { Rides } from 'src/Rider/Domain/rides';
import { RidesEntity } from '../Entity/rides.entity';

export class RidesMapper{
  static toDomain(raw: RidesEntity): Rides {
    const domainEntity = new Rides();
    domainEntity.id = raw.id;
    domainEntity.at_pickup_locationAT = raw.at_pickup_locationAT;
    domainEntity.at_dropoff_locationAT = raw.at_dropoff_locationAT;
    domainEntity.picked_up_parcelAT = raw.picked_up_parcelAT;
    domainEntity.enroute_to_pickup_locationAT = raw.enroute_to_pickup_locationAT;
    domainEntity.enroute_to_dropoff_locationAT = raw.enroute_to_dropoff_locationAT;
    domainEntity.dropped_off_parcelAT = raw.dropped_off_parcelAT;
    domainEntity.cancelledAt = raw.cancelledAt;
    domainEntity.isCancelled = raw.isCancelled;
    domainEntity.reason_for_cancelling_ride = raw.reason_for_cancelling_ride;
    domainEntity.milestone = raw.milestone;
    domainEntity.checkpointStatus = raw.checkpointStatus;
    domainEntity.status = raw.status;
    domainEntity.rider = raw.rider;
    domainEntity.order = raw.order;
    domainEntity.ridesID = raw.ridesID;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.reminderSent = raw.reminderSent;
    domainEntity.rating = raw.rating;
    domainEntity.review = raw.review
 

    return domainEntity;
  }

  static toPerisitence(domainEntity: Rides): RidesEntity {
    const persistenceEntity = new RidesEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.enroute_to_dropoff_locationAT = domainEntity.enroute_to_dropoff_locationAT;
    persistenceEntity.enroute_to_pickup_locationAT = domainEntity.enroute_to_pickup_locationAT;
    persistenceEntity.at_dropoff_locationAT = domainEntity.at_dropoff_locationAT;
    persistenceEntity.at_pickup_locationAT = domainEntity.at_pickup_locationAT;
    persistenceEntity.dropped_off_parcelAT = domainEntity.dropped_off_parcelAT;
    persistenceEntity.picked_up_parcelAT = domainEntity.picked_up_parcelAT
    persistenceEntity.cancelledAt = domainEntity.cancelledAt;
    persistenceEntity.checkpointStatus = domainEntity.checkpointStatus;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.isCancelled = domainEntity.isCancelled;
    persistenceEntity.reason_for_cancelling_ride = domainEntity.reason_for_cancelling_ride;
    persistenceEntity.order = domainEntity.order;
    persistenceEntity.rider = domainEntity.rider;
    persistenceEntity.milestone = domainEntity.milestone;
    persistenceEntity.ridesID = domainEntity.ridesID;
    persistenceEntity.createdAT = domainEntity.createdAT;
    persistenceEntity.reminderSent = domainEntity.reminderSent
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.review = domainEntity.review
    
   
    return persistenceEntity;
  }
}
