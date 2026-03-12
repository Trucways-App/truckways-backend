import { RiderEntity } from '../Entity/rider.entity';
import { Rider } from 'src/Rider/Domain/rider';
import { OrderMapper } from 'src/Order/Infrastructure/Persistence/Relational/Mapper/order.mapper';
import { BidMapper } from 'src/Order/Infrastructure/Persistence/Relational/Mapper/bids.mapper';
import { TransactionMapper } from './transaction.mapper';
import { RidesMapper } from './rides.mapper';
import { BankMapper } from './bank.mapper';
import { VehicleMapper } from './vehicle.mapper';
import { Vehicle } from 'src/Rider/Domain/vehicle';

export class RiderMapper {
  static toDomain(raw: RiderEntity): Rider {
    const domainEntity = new Rider();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.deviceToken = raw.deviceToken;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.driversLicenceBack = raw.driversLicenceBack;
    domainEntity.driversLicenceFront = raw.driversLicenceFront;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.profilePicture = raw.profilePicture;
    domainEntity.resetPasswordToken = raw.resetPasswordToken;
    domainEntity.resetPasswordTokenExpTime = raw.resetPasswordTokenExpTime;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.updatedAT = raw.updatedAT;
    domainEntity.riderID = raw.riderID;
    domainEntity.isAprroved = raw.isAprroved;
    domainEntity.isBlocked = raw.isBlocked;
    domainEntity.emailConfirmed = raw.emailConfirmed;
    domainEntity.role = raw.role;
    domainEntity.onboardingPercentage = raw.onboardingPercentage;
    domainEntity.onboardingStatus = raw.onboardingStatus;
    domainEntity.onboardingAction = raw.onboardingAction;
    domainEntity.vehicle = raw.vehicle ? raw.vehicle.map((veh)=>VehicleMapper.toDomain(veh)):[];
    domainEntity.bank_details = raw.bank_details ? raw.bank_details.map((bnk)=>BankMapper.toDomain(bnk)):[];
    domainEntity.my_wallet = raw.my_wallet;
    domainEntity.accepted_orders = raw.accepted_orders
      ? raw.accepted_orders.map((order) => OrderMapper.toDomain(order))
      : [];
    domainEntity.accepted_bids = raw.accepted_bids
      ? raw.accepted_bids.map((bid) => BidMapper.toDomain(bid))
      : [];

    domainEntity.my_transactions = raw.my_transactions
      ? raw.my_transactions.map((trans) => TransactionMapper.toDomain(trans))
      : [];

    domainEntity.rides = raw.rides
      ? raw.rides.map((ride) => RidesMapper.toDomain(ride))
      : [];

    return domainEntity;
  }

  static toPerisitence(domainEntity: Rider): RiderEntity {
    const persistenceEntity = new RiderEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.deviceToken = domainEntity.deviceToken;
    persistenceEntity.riderID = domainEntity.riderID;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.driversLicenceBack = domainEntity.driversLicenceBack;
    persistenceEntity.driversLicenceFront = domainEntity.driversLicenceFront;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.email = domainEntity.email; 
    persistenceEntity.onboardingStatus = domainEntity.onboardingStatus;
    persistenceEntity.onboardingAction = domainEntity.onboardingAction;
    persistenceEntity.onboardingPercentage = domainEntity.onboardingPercentage;

    persistenceEntity.password = domainEntity.password;
    persistenceEntity.emailConfirmed = domainEntity.emailConfirmed;
    persistenceEntity.isAprroved = domainEntity.isAprroved;
    persistenceEntity.isBlocked = domainEntity.isBlocked;
    persistenceEntity.accepted_orders = domainEntity.accepted_orders
      ? domainEntity.accepted_orders.map((order) =>
          OrderMapper.toPersistence(order),
        )
      : [];

    persistenceEntity.accepted_bids = domainEntity.accepted_bids
      ? domainEntity.accepted_bids.map((bid) => BidMapper.toPeristence(bid))
      : [];

    persistenceEntity.profilePicture = domainEntity.profilePicture;
    persistenceEntity.resetPasswordToken = domainEntity.resetPasswordToken;
    persistenceEntity.resetPasswordTokenExpTime =
      domainEntity.resetPasswordTokenExpTime;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.createdAT = domainEntity.createdAT;
    persistenceEntity.my_wallet = domainEntity.my_wallet;
    persistenceEntity.vehicle = domainEntity.vehicle ? domainEntity.vehicle.map((veh)=>VehicleMapper.toPersistence(veh)):[];
    persistenceEntity.bank_details = domainEntity.bank_details ? domainEntity.bank_details.map((bnk)=>BankMapper.toPersistence(bnk)):[];
    persistenceEntity.my_transactions = domainEntity.my_transactions
      ? domainEntity.my_transactions.map((trans) =>
          TransactionMapper.toPersistence(trans),
        )
      : [];

    persistenceEntity.rides = domainEntity.rides
      ? domainEntity.rides.map((ride) => RidesMapper.toPerisitence(ride))
      : [];
    return persistenceEntity;
  }
}
