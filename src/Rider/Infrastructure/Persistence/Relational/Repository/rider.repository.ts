import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BankRepository,
  RiderRepository,
  RidesRepository,
  TransactionRepository,
  VehicleRepository,
  WalletRepository,
} from '../../rider-repository';
import { DataSource, LessThan, Repository } from 'typeorm';
import { RiderMapper } from '../Mapper/rider.mapper';
import { RiderEntity } from '../Entity/rider.entity';
import { Rider } from 'src/Rider/Domain/rider';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';
import { VehicleEntity } from '../Entity/vehicle.entity';
import { Vehicle } from 'src/Rider/Domain/vehicle';
import { VehicleMapper } from '../Mapper/vehicle.mapper';
import { BankEntity } from '../Entity/bank.entity';
import { Bank } from 'src/Rider/Domain/bank';
import { BankMapper } from '../Mapper/bank.mapper';
import { WalletEntity } from '../Entity/wallet.entity';
import { Wallet } from 'src/Rider/Domain/wallet';
import { WalletMapper } from '../Mapper/wallet.mapper';
import { Transactions } from 'src/Rider/Domain/transaction';
import { TransactionMapper } from '../Mapper/transaction.mapper';
import { TransactionEntity } from '../Entity/transaction.entity';
import { Rides } from 'src/Rider/Domain/rides';
import { RidesMapper } from '../Mapper/rides.mapper';
import { RidesEntity } from '../Entity/rides.entity';
import { RideStatus } from 'src/Enums/order.enum';
import { TransactionStatus } from 'src/Enums/transaction.enum';

export class RiderRelationalRepository implements RiderRepository {
  constructor(
    @InjectRepository(RiderEntity)
    private riderEntityRepository: Repository<RiderEntity>,
  ) {}

  async profile(rider: Rider): Promise<Rider> {
    const riderProfile = await this.riderEntityRepository.findOne({
      where: { riderID: rider.riderID },
      relations: ['my_wallet', 'vehicle', 'bank_details'],
    });
    return riderProfile ? RiderMapper.toDomain(riderProfile) : null;
  }

  async create(rider: Rider): Promise<Rider> {
    const persistenceRider = RiderMapper.toPerisitence(rider);
    const savedRider = await this.riderEntityRepository.save(persistenceRider);
    return RiderMapper.toDomain(savedRider);
  }

  async findByID(id: number): Promise<Rider> {
    const rider = await this.riderEntityRepository.findOne({
      where: { id: id },
      relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
    });
    return rider ? RiderMapper.toDomain(rider) : null;
  }

  async findByEmail(email: string): Promise<Rider> {
    const rider = await this.riderEntityRepository.findOne({
      where: { email: email },
      relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
    });
    return rider ? RiderMapper.toDomain(rider) : null;
  }

  async findbyPasswordResetToken(token: string): Promise<Rider> {
    const rider = await this.riderEntityRepository.findOne({
      where: { resetPasswordToken: token },
      relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
    });
    return rider ? RiderMapper.toDomain(rider) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Rider[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.riderEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
    });
    const riders = result.map(RiderMapper.toDomain);
    return { data: riders, total };
  }

  async find2(): Promise<Rider[]> {
    const result = await this.riderEntityRepository.find({
      relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
    });
    const riders = result.map(RiderMapper.toDomain);
    return riders;
  }

  async findRidersForAnnouncement(): Promise<Rider[]> {
    const result = await this.riderEntityRepository.find({
      where: { isAprroved: true },
      //relations: ['my_wallet', 'vehicle', 'bank_details','rides','my_transactions'],
      select: ['email', 'riderID', 'deviceToken'],
    });
    const wallets = result.map(RiderMapper.toDomain);
    return wallets;
  }

  async update(id: number, rider: Partial<Rider>): Promise<Rider> {
    await this.riderEntityRepository.update(
      id,
      RiderMapper.toPerisitence(rider as Rider),
    );
    const updatedRider = await this.riderEntityRepository.findOne({
      where: { id: id },
    });
    return RiderMapper.toDomain(updatedRider);
  }

  async remove(id: string): Promise<void> {
    await this.riderEntityRepository.delete(id);
  }

  async save(rider: Rider): Promise<Rider> {
    const persistenceRider = RiderMapper.toPerisitence(rider);
    const savedRider = await this.riderEntityRepository.save(persistenceRider, {
      reload: true,
    });

    return RiderMapper.toDomain(savedRider);
  }

  async searchRider(
    searchDto: SearchDto,
  ): Promise<{ data: Rider[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.riderEntityRepository.createQueryBuilder('rider');

    if (keyword) {
      qb.where('rider.name ILIKE :keyword', { keyword: `%${keyword}%` });
      qb.orWhere('rider.riderID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      qb.orWhere('rider.email ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Sorting
    qb.orderBy(`rider.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [riders, total] = await qb.getManyAndCount();

    return { data: riders, total };
  }

  async RiderCount():Promise<number>{
    return await this.riderEntityRepository.count()
  }
}

//vehicle

export class VehicleRelationalRepository implements VehicleRepository {
  constructor(
    @InjectRepository(VehicleEntity)
    private vehicleEntityRepository: Repository<VehicleEntity>,
  ) {}

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const persistenceVehicle = VehicleMapper.toPersistence(vehicle);
    const savedVehicle =
      await this.vehicleEntityRepository.save(persistenceVehicle);
    return VehicleMapper.toDomain(savedVehicle);
  }

  async findByID(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleEntityRepository.findOne({
      where: { vehicleID: id },

    });
    return vehicle ? VehicleMapper.toDomain(vehicle) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Vehicle[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.vehicleEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['accepted_orders', 'vehicle', 'bank_details'],
    });
    const vehicles = result.map(VehicleMapper.toDomain);
    return { data: vehicles, total };
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    await this.vehicleEntityRepository.update(
      id,
      VehicleMapper.toPersistence(vehicle as Vehicle),
    );
    const updatedVehicle = await this.vehicleEntityRepository.findOne({
      where: { vehicleID: id },
    });
    return VehicleMapper.toDomain(updatedVehicle);
  }

  async remove(id: string): Promise<void> {
    await this.vehicleEntityRepository.delete(id);
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    const persistenceRider = VehicleMapper.toPersistence(vehicle);
    const savedVehicle = await this.vehicleEntityRepository.save(
      persistenceRider,
      { reload: true },
    );

    return VehicleMapper.toDomain(savedVehicle);
  }

  async searchVehicle(
    searchDto: SearchDto,
  ): Promise<{ data: Vehicle[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.vehicleEntityRepository.createQueryBuilder('vehicle');

    if (keyword) {
      qb.where('vehicle.vehicleType ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      qb.orWhere('vehicle.vehicleID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      qb.orWhere('vehicle.plateNumber ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Sorting
    qb.orderBy(`vehicle.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [vehicles, total] = await qb.getManyAndCount();

    return { data: vehicles, total };
  }
}

//bank
export class BankRelationalRepository implements BankRepository {
  constructor(
    @InjectRepository(BankEntity)
    private bankEntityRepository: Repository<BankEntity>,
  ) {}

  async create(bank: Bank): Promise<Bank> {
    const persistenceBank = BankMapper.toPersistence(bank);
    const savedVehicle = await this.bankEntityRepository.save(persistenceBank);
    return BankMapper.toDomain(savedVehicle);
  }

  async findByID(id: string): Promise<Bank> {
    const bank = await this.bankEntityRepository.findOne({
      where: { bankID: id },
    });
    return bank ? BankMapper.toDomain(bank) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Bank[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.bankEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['owner'],
    });
    const banks = result.map(BankMapper.toDomain);
    return { data: banks, total };
  }

  async update(id: string, bank: Partial<Bank>): Promise<Bank> {
    await this.bankEntityRepository.update(
      id,
      BankMapper.toPersistence(bank as Bank),
    );
    const updatedBank = await this.bankEntityRepository.findOne({
      where: { bankID: id },
    });
    return BankMapper.toDomain(updatedBank);
  }

  async remove(id: string): Promise<void> {
    await this.bankEntityRepository.delete(id);
  }

  async save(bank: Bank): Promise<Bank> {
    const persistenceBank = BankMapper.toPersistence(bank);
    const savedBank = await this.bankEntityRepository.save(persistenceBank, {
      reload: true,
    });

    return BankMapper.toDomain(savedBank);
  }
}

//wallet
export class WalletRelationalRepository implements WalletRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
  ) {}

  async create(wallet: Wallet): Promise<Wallet> {
    const persistenceWallet = WalletMapper.toPersistence(wallet);
    const savedWallet =
      await this.walletEntityRepository.save(persistenceWallet);
    return WalletMapper.toDomain(savedWallet);
  }

  async findByID(id: string): Promise<Wallet> {
    const wallet = await this.walletEntityRepository.findOne({
      where: { walletAddrress: id },
    });
    return wallet ? WalletMapper.toDomain(wallet) : null;
  }

  async findByRiderID(id: string): Promise<Wallet> {
    const wallet = await this.walletEntityRepository.findOne({
      where: { rider: { riderID: id } },
      relations: ['rider', 'rider.my_wallet'],
    });
    return wallet ? WalletMapper.toDomain(wallet) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Wallet[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.walletEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['owner'],
    });
    const wallets = result.map(WalletMapper.toDomain);
    return { data: wallets, total };
  }

  async update(id: string, wallet: Partial<Wallet>): Promise<Wallet> {
    await this.walletEntityRepository.update(
      id,
      WalletMapper.toPersistence(wallet as Wallet),
    );
    const updatedWallet = await this.walletEntityRepository.findOne({
      where: { walletAddrress: id },
    });
    return WalletMapper.toDomain(updatedWallet);
  }

  async remove(id: string): Promise<void> {
    await this.walletEntityRepository.delete(id);
  }

  async save(wallet: Wallet): Promise<Wallet> {
    const persistenceWallet = WalletMapper.toPersistence(wallet);
    const savedWallet = await this.walletEntityRepository.save(
      persistenceWallet,
      { reload: true },
    );

    return WalletMapper.toDomain(savedWallet);
  }
}

export class TransactionRelationalRepository implements TransactionRepository {
  private repository: Repository<TransactionEntity>;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(TransactionEntity);
  }

  async create(transaction: Transactions): Promise<Transactions> {
    const persistenceTransaction = TransactionMapper.toPersistence(transaction);
    const savedTransaction = await this.repository.save(persistenceTransaction);
    return TransactionMapper.toDomain(savedTransaction);
  }

  async findByID(id: string): Promise<Transactions> {
    const transaction = await this.repository.findOne({
      where: { transactionID: id },
    });
    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async findByReference(reference: string): Promise<Transactions> {
    const transaction = await this.repository.findOne({
      where: {  metadata: { type: 'wallet_funding', orderReference:reference } },
      relations:['rider']
    });
    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async findByReferenceFinal(reference: string): Promise<Transactions> {
    const transaction = await this.repository.findOne({
      where: {
        
        metadata: { type: 'final_wallet_funding' ,orderReference:reference},
      },
    });
    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async find(
    dto: PaginationDto,
  ): Promise<{ data: Transactions[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['rider'],
    });
    const transactions = result.map(TransactionMapper.toDomain);
    return { data: transactions, total };
  }

  async findRelatedToCustomer(
    customerId:string,
    dto: PaginationDto,
  ): Promise<{ data: Transactions[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.repository.findAndCount({
      where:{customer:{customerID:customerId}},
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['rider'],
    });
    const transactions = result.map(TransactionMapper.toDomain);
    return { data: transactions, total };
  }

  async findRelatedToRider(
    riderID:string,
    dto: PaginationDto,
  ): Promise<{ data: Transactions[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.repository.findAndCount({
      where:{rider:{riderID:riderID}},
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['rider'],
    });
    const transactions = result.map(TransactionMapper.toDomain);
    return { data: transactions, total };
  }

  async save(transaction: Transactions): Promise<Transactions> {
    const persistenceTransaction = TransactionMapper.toPersistence(transaction);
    const savedTransaction = await this.repository.save(
      persistenceTransaction,
      {
        reload: true,
      },
    );
    return TransactionMapper.toDomain(savedTransaction);
  }

  async searchTransactions(
    searchDto: SearchDto,
  ): Promise<{ data: Transactions[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.repository.createQueryBuilder('tran');

    if (keyword) {
      qb.where('tran.transactionID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      })
        .orWhere('tran.walletAddrress ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('tran.description ILIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('tran.reference ILIKE :keyword', {
          keyword: `%${keyword}%`,
        });
    }

    qb.orderBy(`tran.${sort}`, sortOrder);

    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    const [transactions, total] = await qb.getManyAndCount();
    const domainTransactions = transactions.map(TransactionMapper.toDomain);

    return { data: domainTransactions, total };
  }

  async executeWithTransaction<T>(
    operation: (repository: Repository<TransactionEntity>) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(
        queryRunner.manager.getRepository(TransactionEntity),
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Add these methods to your TransactionRelationalRepository class

// Add these methods to your TransactionRelationalRepository class

async getTotalPaymentsMade(): Promise<number> {
  // Fix: Use the correct JSON syntax and ensure enum value matches database
  const result = await this.repository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'total')
    .where("transaction.metadata->>'type' = :type", { type: 'order_payment' })
    .andWhere('transaction.status = :status', { status: TransactionStatus.SUCCESSFUL })
    .getRawOne();
  
  return result && result.total ? parseFloat(result.total) : 0;
}

async getTotalRevenue(): Promise<number> {
  // Fix: Use the correct enum value from TransactionStatus enum
  const successfulStatus = TransactionStatus.SUCCESSFUL;
  
  const result = await this.dataSource.query(`
    WITH order_payments AS (
      SELECT 
        transaction.reference as order_id,
        transaction.amount as total_amount
      FROM transactions as transaction
      WHERE transaction.metadata->>'type' = 'order_payment'
      AND transaction.status = $1
    ),
    rider_payments AS (
      SELECT
        transaction.metadata->>'orderReference' as order_id,
        SUM(transaction.amount) as disbursed_amount
      FROM transactions as transaction
      WHERE (transaction.metadata->>'type' = 'wallet_funding' OR transaction.metadata->>'type' = 'final_wallet_funding')
      AND transaction.status = $1
      GROUP BY transaction.metadata->>'orderReference'
    )
    SELECT COALESCE(SUM(op.total_amount - COALESCE(rp.disbursed_amount, 0)), 0) as total_revenue
    FROM order_payments op
    LEFT JOIN rider_payments rp ON op.order_id = rp.order_id
  `, [successfulStatus]);
  
  return result && result[0] && result[0].total_revenue ? parseFloat(result[0].total_revenue) : 0;
}

async getTotalDisbursedMoney(): Promise<number> {
  // Fix: Use the correct JSON syntax and ensure enum value matches database
  const result = await this.repository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'total')
    .where("(transaction.metadata->>'type' = :initialType OR transaction.metadata->>'type' = :finalType)", { 
      initialType: 'wallet_funding', 
      finalType: 'final_wallet_funding' 
    })
    .andWhere('transaction.status = :status', { status: TransactionStatus.SUCCESSFUL })
    .getRawOne();
  
  return result && result.total ? parseFloat(result.total) : 0;
}

async getTotalUndisbursedMoney(): Promise<number> {
  // Fix: Use the correct enum value from TransactionStatus enum
  const successfulStatus = TransactionStatus.SUCCESSFUL;
  
  const result = await this.dataSource.query(`
    WITH completed_orders AS (
      SELECT 
        o.order_id,
        o.total_amount,
        COALESCE(r.disbursed_amount, 0) as disbursed_amount
      FROM (
        SELECT 
          transaction.reference as order_id,
          transaction.amount as total_amount
        FROM transactions as transaction
        WHERE transaction.metadata->>'type' = 'order_payment'
        AND transaction.status = $1
      ) o
      LEFT JOIN (
        SELECT
          transaction.metadata->>'orderReference' as order_id,
          SUM(transaction.amount) as disbursed_amount
        FROM transactions as transaction
        WHERE (transaction.metadata->>'type' = 'wallet_funding' OR transaction.metadata->>'type' = 'final_wallet_funding')
        AND transaction.status = $1
        GROUP BY transaction.metadata->>'orderReference'
      ) r ON o.order_id = r.order_id
    )
    SELECT COALESCE(SUM(
      CASE 
        WHEN co.total_amount > co.disbursed_amount THEN co.total_amount - co.disbursed_amount
        ELSE 0
      END
    ), 0) as undisbursed_amount
    FROM completed_orders co
  `, [successfulStatus]);
  
  return result && result[0] && result[0].undisbursed_amount ? parseFloat(result[0].undisbursed_amount) : 0;
}

// Add a convenience method to get all metrics at once
async getTransactionMetrics(): Promise<{
  totalPaymentsMade: number;
  totalRevenue: number;
  totalDisbursedMoney: number;
  totalUndisbursedMoney: number;
}> {
  const [totalPaymentsMade, totalRevenue, totalDisbursedMoney, totalUndisbursedMoney] = await Promise.all([
    this.getTotalPaymentsMade(),
    this.getTotalRevenue(),
    this.getTotalDisbursedMoney(),
    this.getTotalUndisbursedMoney()
  ]);
  
  return {
    totalPaymentsMade,
    totalRevenue,
    totalDisbursedMoney,
    totalUndisbursedMoney
  };
}
}
export class RidesRelationalRepository implements RidesRepository {
  constructor(
    @InjectRepository(RidesEntity)
    private ridesEntityRepository: Repository<RidesEntity>,
  ) {}

  async create(transaction: Rides): Promise<Rides> {
    const persistencetransaction = RidesMapper.toPerisitence(transaction);
    const savedTransaction = await this.ridesEntityRepository.save(
      persistencetransaction,
    );
    return RidesMapper.toDomain(savedTransaction);
  }

  async findByID(id: string): Promise<Rides> {
    const wallet = await this.ridesEntityRepository.findOne({
      where: { ridesID: id },
      relations: ['rider', 'order', 'order.items'],
    });
    return wallet ? RidesMapper.toDomain(wallet) : null;
  }

  async findByIDRelatedtoRider(id: string, riderId: string): Promise<Rides> {
    const wallet = await this.ridesEntityRepository.findOne({
      where: { ridesID: id, rider: { riderID: riderId } },
      relations: ['rider', 'order', 'order.items'],
    });
    return wallet ? RidesMapper.toDomain(wallet) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Rides[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.ridesEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['rider', 'order', 'order.items'],
    });
    const wallets = result.map(RidesMapper.toDomain);
    return { data: wallets, total };
  }

  async findLongRunningRides(cutoffDate: Date): Promise<Rides[]> {
    return this.ridesEntityRepository.find({
      where: {
        status: RideStatus.ONGOING,
        createdAT: LessThan(cutoffDate),
        reminderSent: false,
      },
      relations: ['rider', 'order'],
    });
  }

  async save(transaction: Rides): Promise<Rides> {
    const persistenceWallet = RidesMapper.toPerisitence(transaction);
    const savedWallet = await this.ridesEntityRepository.save(
      persistenceWallet,
      { reload: true },
    );

    return RidesMapper.toDomain(savedWallet);
  }

  async findAllRelatedToARider(
    dto: PaginationDto,
    riderId: string,
  ): Promise<{ data: Rides[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.ridesEntityRepository.findAndCount({
      where: { rider: { riderID: riderId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['rider', 'order', 'order.items'],
    });
    const wallets = result.map(RidesMapper.toDomain);
    return { data: wallets, total };
  }

  async searchRides(
    searchDto: SearchDto,
  ): Promise<{ data: Rides[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.ridesEntityRepository.createQueryBuilder('ride');

    if (keyword) {
      qb.where('ride.ridesID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Sorting
    qb.orderBy(`ride.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [rides, total] = await qb.getManyAndCount();

    return { data: rides, total };
  }

  async update(id: number, wallet: Partial<Rides>): Promise<Rides> {
    await this.ridesEntityRepository.update(
      id,
      WalletMapper.toPersistence(wallet as Wallet),
    );
    const updatedWallet = await this.ridesEntityRepository.findOne({
      where: { id: id },
    });
    return RidesMapper.toDomain(updatedWallet);
  }
}
