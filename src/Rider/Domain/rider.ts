import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsJSON,
  IsNumber,
  IsString,
} from 'class-validator';
import { OnboardingAction, RiderStatus, Role } from 'src/Enums/users.enum';
import { VehicleEntity } from '../Infrastructure/Persistence/Relational/Entity/vehicle.entity';
import { BankEntity } from '../Infrastructure/Persistence/Relational/Entity/bank.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { WalletEntity } from '../Infrastructure/Persistence/Relational/Entity/wallet.entity';
import { BidEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bids.entity';
import { TransactionEntity } from '../Infrastructure/Persistence/Relational/Entity/transaction.entity';
import { RidesEntity } from '../Infrastructure/Persistence/Relational/Entity/rides.entity';

export class Rider {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  riderID: string;

  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @Exclude()
  password: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ type: String })
  deviceToken: string;

  @ApiProperty({ type: String })
  @IsString()
  city: string;

  @ApiProperty({ type: String })
  @IsString()
  state: string;

  @ApiProperty({ type: String })
  @IsString()
  companyRegNum: string;

  @ApiProperty({ type: String })
  @IsString()
  driversLicenceFront: string;

  @ApiProperty({ type: String })
  @IsString()
  driversLicenceBack: string;

  @ApiProperty({
    type: 'object',
    properties: {
      address: { type: 'string' },
      lat: { type: 'number' },
      lon: { type: 'number' },
    },
  })
  @IsJSON()
  address: {
    address: string;
    lat: number;
    lon: number;
  };

  @ApiProperty({ type: String })
  @IsString()
  profilePicture: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  emailConfirmed: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isAprroved: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isBlocked: boolean;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ enum: RiderStatus })
  @IsEnum(RiderStatus)
  RiderStatus: RiderStatus;

  @ApiProperty({ type: String })
  @IsString()
  resetPasswordToken: string;

  @ApiProperty()
  @IsDate()
  resetPasswordTokenExpTime: Date;

  @ApiProperty()
  @IsDate()
  createdAT: Date;

  @ApiProperty()
  @IsDate()
  updatedAT: Date;

  //relationships

  //rides

  //vehicle
  @ApiProperty({ type: () => [VehicleEntity] })
  vehicle: VehicleEntity[];

  //bank  info
  @ApiProperty({ type: () => [BankEntity] })
  bank_details: BankEntity[];

  //accepted orders
  @ApiProperty({ type: () => [OrderEntity] })
  accepted_orders: OrderEntity[];

  @ApiProperty({ type: () => [BidEntity] })
  accepted_bids: BidEntity[];

  @ApiProperty({ enum: OnboardingAction })
  @IsEnum(OnboardingAction)
  onboardingAction?: OnboardingAction;

  @ApiProperty()
  @IsJSON()
  onboardingStatus?: { [key in OnboardingAction]: boolean };

  @ApiProperty({ type: Number })
 @IsNumber()
  onboardingPercentage?: number;

  //wallet
  @ApiProperty({ type: () => WalletEntity })
  my_wallet: WalletEntity;

  @ApiProperty({ type: () => [TransactionEntity] })
  my_transactions: TransactionEntity[];

  @ApiProperty({type:()=>[RidesEntity]})
  rides: RidesEntity[];
}
