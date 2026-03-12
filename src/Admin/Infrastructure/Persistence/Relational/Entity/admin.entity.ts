import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/Enums/users.enum';
import { OrderCartEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order-cart.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'admins' })
export class AdminEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  adminID: string;

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



  
}
