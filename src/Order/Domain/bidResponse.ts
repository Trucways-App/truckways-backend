import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { BidEntity } from '../Infrastructure/Persistence/Relational/Entity/bids.entity';
import { RiderBidResponseStatus } from '../Infrastructure/Persistence/Relational/Entity/bidResponse.entity';

export class RiderBidResponse {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  responseID: string; // Unique identifier for this response

  @ApiProperty({ type: () => RiderEntity })
  rider: RiderEntity;

  @ApiProperty({ type: () => BidEntity })
  bid: BidEntity;

  @ApiProperty({ enum: RiderBidResponseStatus })
  @IsEnum(RiderBidResponseStatus)
  status: RiderBidResponseStatus;

  @ApiProperty()
  @IsDate()
  respondedAt: Date;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isVisible: boolean; // Whether the bid should be visible to this rider
}
