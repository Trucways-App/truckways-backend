import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
import { EntityRelationalHelper } from '../relational-entity.helper';
  
  @Entity('notifications')
  export class NotificationsEntity extends EntityRelationalHelper {
    @ApiProperty({ type: Number })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({type:String})
    @Column({nullable:true})
    notificationID:string
  
    @ApiProperty({})
    @CreateDateColumn()
    date: Date;
  
    @ApiProperty({ type: String })
    @Column({ nullable: false })
    account: string;
  
    @ApiProperty({ type: String })
    @Column({ nullable: false })
    message: string;
  
    @ApiProperty({ type: String })
    @Column({ nullable: false })
    subject: string;
  
    @ApiProperty({ type: Boolean })
    @Column({ nullable: true, type: 'boolean', default: false })
    isRead: boolean;

    @ApiProperty({})
    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;
  }
  