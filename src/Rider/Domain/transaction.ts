import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from 'src/Enums/transaction.enum';
import { TransactionMetadata } from '../Infrastructure/Persistence/Relational/Entity/transaction.entity';
import { RiderEntity } from '../Infrastructure/Persistence/Relational/Entity/rider.entity';
import { IsDate, IsEnum, IsJSON, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';

export class Transactions {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  transactionID: string

  @ApiProperty({ type: String })
  @IsString()
  walletAddrress?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty()
  @IsDate()
  createdAT: Date;

  @ApiProperty({ type: String })
  @IsString()
  reference: string;

  @ApiProperty({ type: String })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Transaction metadata including type and additional details',
  })
  @IsJSON()
  metadata: TransactionMetadata;

  @ApiPropertyOptional({ type: () => RiderEntity })
  rider?: RiderEntity;

  @ApiPropertyOptional({ type: () => CustomerEntity})
  customer?:CustomerEntity
}
