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

export class Admin {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  adminID: string;

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


}
