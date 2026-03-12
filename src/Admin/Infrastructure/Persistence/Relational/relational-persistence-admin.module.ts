import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './Entity/admin.entity';
import { AdminRelationalRepository, AnnouncenentRelationalRepository, PercentageConfigRelationalRepository } from './Repository/admin.repository';
import { AdminRepository, AnnounceRepository, PercentageConfigRepository } from '../admin-repository';
import { PercentageConfigEntity } from './Entity/percentage-configuration.entity';
import { AnnouncementEntity } from './Entity/announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity,PercentageConfigEntity,AnnouncementEntity])],
  providers: [
    {
      provide: AdminRepository,
      useClass: AdminRelationalRepository,
    },
    {
      provide:PercentageConfigRepository,
      useClass:PercentageConfigRelationalRepository
    },
    {
      provide:AnnounceRepository,
      useClass:AnnouncenentRelationalRepository
    }
  ],
  exports:[AdminRepository,PercentageConfigRepository,AnnounceRepository]
})
export class RelationalPersistenceAdminModule {}
