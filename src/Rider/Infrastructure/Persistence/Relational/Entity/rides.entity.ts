import { ApiProperty } from '@nestjs/swagger';
import { RideStatus, RiderMileStones } from 'src/Enums/order.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RiderEntity } from './rider.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';

@Entity({ name: 'Rides' })
export class RidesEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  ridesID: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  reason_for_cancelling_ride: string;

  @ApiProperty({ type: String })
  @Column({ nullable: true, type: 'boolean', default: false })
  isCancelled: boolean;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  cancelledAt: Date;

  @ApiProperty({ enum: RideStatus })
  @Column({ nullable: true, type: 'enum', enum: RideStatus })
  status: RideStatus;

  @ApiProperty({ enum: RiderMileStones })
  @Column({ nullable: true, type: 'enum', enum: RiderMileStones })
  milestone: RiderMileStones;

  @ApiProperty()
  @Column('jsonb', { nullable: false, default: '{}' })
  checkpointStatus: { [key in RiderMileStones]: boolean };

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  enroute_to_pickup_locationAT: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  at_pickup_locationAT: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  picked_up_parcelAT: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  enroute_to_dropoff_locationAT: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  at_dropoff_locationAT: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'timestamp' })
  dropped_off_parcelAT: Date;

  @ApiProperty({ type: () => RiderEntity })
  @ManyToOne(() => RiderEntity, (rider) => rider.rides, {
    onDelete: 'SET NULL',
  })
  rider: RiderEntity;

  @ApiProperty({ type: () => OrderEntity })
  @ManyToOne(() => OrderEntity, (order) => order.ride)
  order: OrderEntity;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  createdAT: Date;

  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty({type:Number})
  @Column({ type: 'float', nullable: true })
  rating: number;

  @ApiProperty({type:String})
  @Column({ type: 'text', nullable: true })
  review: string;

}
