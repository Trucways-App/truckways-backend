import { ApiProperty } from '@nestjs/swagger';
import { RideStatus, RiderMileStones } from 'src/Enums/order.enum';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsJSON,
  IsNumber,
  IsString,
} from 'class-validator';
import { RiderStatus } from 'src/Enums/users.enum';
import { RiderEntity } from '../Infrastructure/Persistence/Relational/Entity/rider.entity';

export class Rides {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({type:String})
  @IsString()
  ridesID:string

  @ApiProperty({ type: String })
  @IsString()
  reason_for_cancelling_ride: string;

  @ApiProperty({ type: String })
  @IsBoolean()
  isCancelled: boolean;

  @ApiProperty()
  @IsDate()
  cancelledAt: Date;

  @ApiProperty({ enum: RideStatus })
  @IsEnum(RiderStatus)
  status: RideStatus;

  @ApiProperty({ enum: RiderMileStones })
  @IsEnum(RiderMileStones)
  milestone: RiderMileStones;

  @ApiProperty()
  @IsJSON()
  checkpointStatus: { [key in RiderMileStones]: boolean };

  @ApiProperty()
  @IsDate()
  enroute_to_pickup_locationAT: Date;

  @ApiProperty()
  @IsDate()
  at_pickup_locationAT: Date;

  @ApiProperty()
  @IsDate()
  picked_up_parcelAT: Date;

  @ApiProperty()
  @IsDate()
  enroute_to_dropoff_locationAT: Date;

  @ApiProperty()
  @IsDate()
  at_dropoff_locationAT: Date;

  @ApiProperty()
  @IsDate()
  dropped_off_parcelAT: Date;

  @ApiProperty({ type: () => RiderEntity })
  rider: RiderEntity;

  @ApiProperty({ type: () => OrderEntity })
  order: OrderEntity;

  @ApiProperty()
  @IsDate()
  createdAT: Date;

  @ApiProperty()
  @IsBoolean()
  reminderSent: boolean;

  @ApiProperty({type:Number})
  @IsNumber()
  rating: number;

  @ApiProperty({type:String})
  @IsString()
  review: string;
}
