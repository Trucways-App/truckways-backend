import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderEntity } from './Entity/rider.entity';
import {
  BankRepository,
  RiderRepository,
  RidesRepository,
  TransactionRepository,
  VehicleRepository,
  WalletRepository,
} from '../rider-repository';
import {
  BankRelationalRepository,
  RiderRelationalRepository,
  RidesRelationalRepository,
  TransactionRelationalRepository,
  VehicleRelationalRepository,
  WalletRelationalRepository,
} from './Repository/rider.repository';
import { VehicleEntity } from './Entity/vehicle.entity';
import { BankEntity } from './Entity/bank.entity';
import { WalletEntity } from './Entity/wallet.entity';
import { TransactionEntity } from './Entity/transaction.entity';
import { RidesEntity } from './Entity/rides.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RiderEntity,
      VehicleEntity,
      BankEntity,
      WalletEntity,
      TransactionEntity,
      RidesEntity
    ]),
  ],
  providers: [
    {
      provide: RiderRepository,
      useClass: RiderRelationalRepository,
    },
    {
      provide: VehicleRepository,
      useClass: VehicleRelationalRepository,
    },
    {
      provide: BankRepository,
      useClass: BankRelationalRepository,
    },
    {
      provide: WalletRepository,
      useClass: WalletRelationalRepository,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionRelationalRepository,
    },
    {
      provide :RidesRepository,
      useClass :RidesRelationalRepository
    }

  ],
  exports: [
    RiderRepository,
    BankRepository,
    VehicleRepository,
    WalletRepository,
    TransactionRepository,
    RidesRepository
  ],
})
export class RelationalPersistenceRiderModule {}
