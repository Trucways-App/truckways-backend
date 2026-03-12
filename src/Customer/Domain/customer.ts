import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsJSON,
  IsNumber,
  IsString,
} from 'class-validator';
import { Role } from 'src/Enums/users.enum';
import { OrderCartEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order-cart.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { TransactionEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/transaction.entity';

export class Customer {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  customerID: string;

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
  altrnatePhoneNumber: string;

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
  isVerified: boolean;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

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

  @ApiProperty({ type: () => OrderCartEntity })
  my_cart: OrderCartEntity;

  //orders
  @ApiProperty({ type: () => [OrderEntity] })
  my_orders: OrderEntity[];

  @ApiProperty({type:[TransactionEntity]})
  my_transaction:TransactionEntity[]
}
