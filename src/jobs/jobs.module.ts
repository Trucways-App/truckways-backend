import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { RelationalPersistenceCustomerModule } from 'src/Customer/Infrastructure/Persistence/Relational/relational-persistence-customer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RelationalPersistenceRiderModule } from 'src/Rider/Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { RideJobService } from './longRunningRides.job';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RelationalPersistenceCustomerModule,
    RelationalPersistenceRiderModule,
    TypeOrmModule.forFeature([NotificationsEntity,RiderEntity]),
  ],
  providers: [RideJobService, NotificationsService, PushNotificationsService],
  exports: [RideJobService,],
})
export class JobsModule {}
