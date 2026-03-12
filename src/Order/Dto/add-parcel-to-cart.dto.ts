import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddParcelToCartDto{

  @ApiProperty({ type: Number,example:3000 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value,10))
  load_value: number;

  @ApiProperty({ type: String,  example:'Electronics'})
  @IsNotEmpty()
  @IsString()
  load_type: string;

  @ApiProperty({ type: String,  example:'fragile please handle with care '})
  @IsNotEmpty()
  @IsString()
  load_description: string;


  @ApiProperty({ type: String ,example:'6 legs Trailer'})
  @IsNotEmpty()
  @IsString()
  truck_type: string;

  @ApiProperty({ type: String,example:'20 aba road sabon gari kano, kano state, Nigeria' })
  @IsNotEmpty()
  @IsString()
  pickup_address: string;

  @ApiProperty({ type: String, example:'10 onitsha road sabon gari kano, kano state, Nigeria' })
  @IsNotEmpty()
  @IsString()
  dropoff_address: string;

  @ApiProperty({ type: String , example:'musty adams'})
  @IsNotEmpty()
  @IsString()
  recipient_name: string;

  @ApiProperty({ type: String ,example:'+2349032504705'})
  @IsNotEmpty()
  @IsString()
  recipient_number: string;

  @ApiProperty({ type: String, example:2000 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value,10))
  initial_bid_value: number;
}