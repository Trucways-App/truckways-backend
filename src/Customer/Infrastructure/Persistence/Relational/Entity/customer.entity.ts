import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/Enums/users.enum';
import { OrderCartEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order-cart.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { TransactionEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/transaction.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'customers' })
export class CustomerEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  customerID: string;

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
  altrnatePhoneNumber: string;

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
  isVerified: boolean;

  @ApiProperty({ enum: Role })
  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

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

  //orders
  @ApiProperty({ type: () => [OrderEntity] })
  @OneToMany(() => OrderEntity, (cart) => cart.customer)
  my_orders: OrderEntity[];

  //cart
  @ApiProperty({ type: () => OrderCartEntity })
  @OneToOne(() => OrderCartEntity, (cart) => cart.customer)
  my_cart: OrderCartEntity;

  @ApiProperty({type:[TransactionEntity]})
  @OneToMany(()=>TransactionEntity, (tran)=>tran.customer)
  my_transaction:TransactionEntity[]

  
}
