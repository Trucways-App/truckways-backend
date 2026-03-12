import { Customer } from "src/Customer/Domain/customer";
import { Bank } from "src/Rider/Domain/bank";
import { Rider } from "src/Rider/Domain/rider";
import { Rides } from "src/Rider/Domain/rides";
import { Transactions } from "src/Rider/Domain/transaction";
import { Vehicle } from "src/Rider/Domain/vehicle";
import { Wallet } from "src/Rider/Domain/wallet";
import { PaginationDto, SearchDto } from "src/utils/shared-dto/pagination.dto";
import { Repository } from "typeorm";
import { TransactionEntity } from "./Relational/Entity/transaction.entity";

export abstract class RiderRepository{
    abstract create(rider:Rider):Promise<Rider>
    abstract findByID(id:number):Promise<Rider | null>
    abstract find(dto:PaginationDto):Promise<{data:Rider[], total:number}>
    abstract  find2():Promise<Rider[]>
    abstract findRidersForAnnouncement():Promise<Rider[]>
    abstract findByEmail(rider:string):Promise<Rider | null>
    abstract findbyPasswordResetToken (token:string):Promise <Rider|null>;
    abstract update (id:number , rider:Partial<Rider>):Promise<Rider>
    abstract remove (id:string):Promise<void>
    abstract profile (rider:Rider):Promise<Rider>
    abstract save (rider:Rider):Promise<Rider>
    abstract searchRider (searchdto:SearchDto):Promise<{data:Rider[], total:number}>
    abstract RiderCount():Promise<number>
}

export abstract class VehicleRepository{
    abstract create(vehicle:Vehicle):Promise<Vehicle>
    abstract findByID(string:string):Promise<Vehicle | null>
    abstract find(dto:PaginationDto):Promise<{data:Vehicle[], total:number}>
    abstract update (id:string , vehicle:Partial<Vehicle>):Promise<Vehicle>
    abstract remove (id:string):Promise<void>
    abstract save (vehicle:Vehicle):Promise<Vehicle>
    abstract searchVehicle (searchdto:SearchDto):Promise<{data:Vehicle[], total:number}>
}

export abstract class BankRepository{
    abstract create(bank:Bank):Promise<Bank>
    abstract findByID(string:string):Promise<Bank | null>
    abstract find(dto:PaginationDto):Promise<{data:Bank[], total:number}>
    abstract update (id:string , bank:Partial<Bank>):Promise<Bank>
    abstract remove (id:string):Promise<void>
    abstract save (bank:Bank):Promise<Bank>
}

export abstract class WalletRepository{
    abstract create(wallet:Wallet):Promise<Wallet>
    abstract findByID(string:string):Promise<Wallet | null>
    abstract findByRiderID(string:string):Promise<Wallet | null>
    abstract find(dto:PaginationDto):Promise<{data:Wallet[], total:number}>
    abstract update (id:string , wallet:Partial<Wallet>):Promise<Wallet>
    abstract remove (id:string):Promise<void>
    abstract save (wallet:Wallet):Promise<Wallet>
}

export abstract class TransactionRepository{
    abstract create(transaction:Transactions):Promise<Transactions>
    abstract findByID(string:string):Promise<Transactions | null>
    abstract findByReference(reference:string):Promise<Transactions | null>
    abstract findByReferenceFinal(reference:string):Promise<Transactions | null>
    abstract find(dto:PaginationDto):Promise<{data:Transactions[], total:number}>
    abstract findRelatedToCustomer(customerid:string,dto:PaginationDto):Promise<{data:Transactions[], total:number}>
    abstract findRelatedToRider(riderid:string,dto:PaginationDto):Promise<{data:Transactions[], total:number}>
    abstract save (transaction:Transactions):Promise<Transactions>
    abstract searchTransactions (searchdto:SearchDto):Promise<{data:Transactions[], total:number}>
    abstract executeWithTransaction<T>(
        operation: (repository: Repository<TransactionEntity>) => Promise<T>
      ): Promise<T>;

    abstract getTransactionMetrics(): Promise<{
        totalPaymentsMade: number;
        totalRevenue: number;
        totalDisbursedMoney: number;
        totalUndisbursedMoney: number;
      }> 
}


export abstract class RidesRepository{
    abstract create(ride:Rides):Promise<Rides>
    abstract findByID(string:string):Promise<Rides | null>
    abstract findByIDRelatedtoRider(string:string, riderId:string):Promise<Rides | null>
    abstract find(dto:PaginationDto):Promise<{data:Rides[], total:number}>
    abstract findLongRunningRides(cutOffDate:Date):Promise<Rides[]>
    abstract findAllRelatedToARider(dto:PaginationDto, riderId:string):Promise<{data:Rides[], total:number}>
    abstract save (ride:Rides):Promise<Rides>
    abstract searchRides (searchdto:SearchDto):Promise<{data:Rides[], total:number}>
    abstract update (id:number , rides:Partial<Rides>):Promise<Rides>
}