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

@Entity('announcements')
export class AnnouncementEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: AnnouncementMeduim })
  @Column({
    type: 'enum',
    enum: AnnouncementMeduim,
  })
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
