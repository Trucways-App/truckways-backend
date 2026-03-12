import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PercentageType } from 'src/Enums/percentage.enum';

@Entity('percentage_configurations')
export class PercentageConfigEntity {

@ApiProperty({type:Number})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({enum:PercentageType})
  @Column({
    type: 'enum',
    enum: PercentageType,
    unique: true
  })
  type: PercentageType;

  @ApiProperty({type:Number})
  @Column('decimal', { 
    precision: 5, 
    scale: 2, 
    comment: 'Percentage value between 0 and 100' 
  })
  percentage: number;

  @ApiProperty({type:Boolean})
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({nullable:true, type:'timestamp'})
  createdAT: Date;

  @ApiProperty()
  @Column({nullable:true, type:'timestamp'})
  updatedAT: Date;
}