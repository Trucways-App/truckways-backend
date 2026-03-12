import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RiderEntity } from './rider.entity';
import { TransactionStatus, TransactionType } from 'src/Enums/transaction.enum';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';



export interface TransactionMetadata {
    type: 'wallet_funding' | 'withdrawal' | 'order_payment'|'final_wallet_funding';
    orderReference?: string;
    bankDetails?: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    };
    customer_fields?: {
      fullname: string;
      phone: string;
    };
    additionalInfo?: Record<string, any>;
  }
@Entity({ name: 'transactions' })
export class TransactionEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ unique: true })
  transactionID: string;

  @ApiProperty({ type: String })
  @Column({ nullable:true })
  walletAddrress?: string;

  @ApiProperty({ type: Number })
  @Column('decimal', { default: 0.0 })
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @Column({ nullable: true, type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  @Column({ nullable: true, type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  createdAT: Date;

  @ApiProperty({ type: String })
  @Column({ nullable:true })
  reference: string;

  @ApiProperty({ type: String })
  @Column({ nullable:true })
  description: string;

  @ApiProperty({
    description: 'Transaction metadata including type and additional details',
  })
  @Column('jsonb', { nullable: true })
  metadata: TransactionMetadata;

  @ApiPropertyOptional({ type: () => RiderEntity })
  @ManyToOne(() => RiderEntity, (rider) => rider.my_transactions)
  rider?: RiderEntity;

  @ApiPropertyOptional({ type: () => CustomerEntity})
  @ManyToOne(() => CustomerEntity, (cus) => cus.my_transaction)
  customer?: CustomerEntity;
}
