import { ApiProperty } from '@nestjs/swagger';
import { OnboardingAction, RiderStatus, Role } from 'src/Enums/users.enum';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleEntity } from './vehicle.entity';
import { BankEntity } from './bank.entity';
import { WalletEntity } from './wallet.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { BidEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bids.entity';
import { TransactionEntity } from './transaction.entity';
import { RidesEntity } from './rides.entity';

@Entity({ name: 'riders' })
export class RiderEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  riderID: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true, unique: true })
  email: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  state: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  companyRegNum: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  driversLicenceFront: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  driversLicenceBack: string;

  @ApiProperty({
    type: 'object',
    properties: {
      address: { type: 'string' },
      lat: { type: 'number' },
      lon: { type: 'number' },
    },
  })
  @Column('json', { nullable: true })
  address: {
    address: string;
    lat: number;
    lon: number;
  };

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  deviceToken: string;

  @ApiProperty({ type: Boolean })
  @Column({ type: 'boolean', default: false })
  emailConfirmed: boolean;

  @ApiProperty({ type: Boolean })
  @Column({ type: 'boolean', default: false })
  isAprroved: boolean;

  @ApiProperty({ type: Boolean })
  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @ApiProperty({ enum: Role })
  @Column({ type: 'enum', enum: Role, default: Role.RIDER })
  role: Role;

  @ApiProperty({ enum: RiderStatus })
  @Column({ type: 'enum', enum: RiderStatus, default: RiderStatus.AVAILABLE })
  RiderStatus: RiderStatus;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  resetPasswordToken: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpTime: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  createdAT: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  updatedAT: Date;

  //relationships

  //accepted orders

  @ApiProperty({ type: () => [OrderEntity] })
  @OneToMany(() => OrderEntity, (order) => order.Rider, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  accepted_orders: OrderEntity[];

  //bids 

  @ApiProperty({ type: () => [BidEntity] })
  @OneToMany(() => BidEntity, (bids) => bids.rider, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  accepted_bids: BidEntity[];


  //vehicle
  @ApiProperty({ type: () => [VehicleEntity] })
  @OneToMany(() => VehicleEntity, (vehicle) => vehicle.owner)
  vehicle: VehicleEntity[];

  //bank  info
  @ApiProperty({ type: () => [BankEntity] })
  @OneToMany(() => BankEntity, (bank) => bank.owner)
  bank_details: BankEntity[];

  //wallet
  @ApiProperty({ type: () => WalletEntity })
  @OneToOne(() => WalletEntity, (wallet) => wallet.rider)
  my_wallet: WalletEntity;

  @ApiProperty({ enum: OnboardingAction })
  @Column({ nullable: true, type: 'enum', enum: OnboardingAction })
  onboardingAction?: OnboardingAction;

  @ApiProperty()
  @Column('jsonb', { nullable: false, default: '{}' })
  onboardingStatus?: { [key in OnboardingAction]: boolean };

  @ApiProperty({ type: Number })
  @Column('decimal', {
    precision: 5,
    scale: 2,
    comment: 'Percentage value between 0 and 100',
    default: 0.0,
  })
  onboardingPercentage?: number;

  //rides

  @ApiProperty({type:()=>[RidesEntity]})
  @OneToMany(()=>RidesEntity, ride=>ride.rider,{nullable:true,onDelete:'SET NULL'})
  rides: RidesEntity[];

  //transactions 

  @ApiProperty({ type: () => [TransactionEntity] })
  @OneToMany(() => TransactionEntity, (transaction) => transaction.rider, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  my_transactions: TransactionEntity[];
}
