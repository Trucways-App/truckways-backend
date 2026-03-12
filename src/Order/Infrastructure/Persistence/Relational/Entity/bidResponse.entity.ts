// rider-bid-response.entity.ts
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BidEntity } from './bids.entity';
import { ApiProperty } from '@nestjs/swagger';


export enum RiderBidResponseStatus {
  NO_RESPONSE = 'NO_RESPONSE',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

@Entity({name:'riderBidResponse'})
export class RiderBidResponseEntity {
@ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column()
  responseID: string; // Unique identifier for this response

  @ApiProperty({ type: ()=> RiderEntity })
  @ManyToOne(() => RiderEntity)
  @JoinColumn()
  rider: RiderEntity;

  @ApiProperty({ type: ()=>BidEntity })
  @ManyToOne(() => BidEntity)
  @JoinColumn()
  bid: BidEntity;

  @ApiProperty({ enum: RiderBidResponseStatus })
  @Column({
    type: 'enum',
    enum: RiderBidResponseStatus,
    default: RiderBidResponseStatus.NO_RESPONSE,
  })
  status: RiderBidResponseStatus;

  @ApiProperty()
  @Column({ nullable: true })
  respondedAt: Date;

  @ApiProperty({ type: Boolean })
  @Column({ default: false })
  isVisible: boolean; // Whether the bid should be visible to this rider
}