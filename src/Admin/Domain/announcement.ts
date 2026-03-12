import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { PercentageType } from 'src/Enums/percentage.enum';
  import {
    AnnonuncmentTargetUser,
    AnnouncementMeduim,
  } from 'src/Enums/announcement.enum';
import { IsEnum, IsNumber } from 'class-validator';
  

  export class Announcement {
    @ApiProperty({ type: Number })
    @IsNumber()
    id: number;
  
    @ApiProperty({ enum: AnnouncementMeduim })
    @IsEnum(AnnouncementMeduim)
    announcementMedium: AnnouncementMeduim;
  
    @ApiProperty({ enum: AnnonuncmentTargetUser })
    @Column({
      type: 'enum',
      enum: AnnonuncmentTargetUser,
    })
    targetUser:AnnonuncmentTargetUser;
  
    @ApiProperty({ type: String })
    @Column({ nullable: true })
    title: string;
  
    @ApiProperty({ type: String })
    @Column({ nullable: true })
    body: string;
  
    @ApiProperty()
    @Column({ nullable: true, type: 'timestamp' })
    createdAT: Date;
  
    @ApiProperty()
    @Column({ nullable: true, type: 'timestamp' })
    updatedAT: Date;
  }
  