import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderCartEntity } from './order-cart.entity';

@Entity({ name: 'cart-Items' })
export class CartItemsEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  cartItemID: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  load_image: string;

  @ApiProperty({ type: Number })
  @Column('decimal', { nullable: true })
  load_value: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  load_type: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  truck_type: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  load_description: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  pickup_address: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  dropoff_address: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  recipient_name: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  recipient_number: string;

  @ApiProperty({ type: String })
  @Column('decimal', { nullable: true })
  initial_bid_value: number;

  @ApiProperty({ type: () => OrderCartEntity })
  @ManyToOne(() => OrderCartEntity, (cart) => cart.items)
  cart: OrderCartEntity;
}
