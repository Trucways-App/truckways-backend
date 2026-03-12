import { Module } from '@nestjs/common';
import { RelationalPersistenceAdminModule } from './Infrastructure/Persistence/Relational/relational-persistence-admin.module';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { ResponseService } from 'src/utils/services/response.service';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { GeneratorService } from 'src/utils/services/generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AdminService} from './admin.service';
import { AdminController} from './admin.controller';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import { PersitenceRelationalOrderModule } from 'src/Order/Infrastructure/Persistence/Relational/persitence.relational.order.module';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { RelationalPersistenceCustomerModule } from 'src/Customer/Infrastructure/Persistence/Relational/relational-persistence-customer.module';
import { RelationalPersistenceRiderModule } from 'src/Rider/Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { MailService } from 'src/mailer/mailer.service';

@Module({
  imports: [
    RelationalPersistenceAdminModule,
    RelationalPersistenceCustomerModule,
    RelationalPersistenceRiderModule,
    PersitenceRelationalOrderModule,
    TypeOrmModule.forFeature([NotificationsEntity, RiderEntity]),
  ],
  providers: [
    NotificationsService,
    ResponseService,
    CloudinaryService,
    GeneratorService,
    JwtService,
    AdminService,
    GeoLocationService,
    EventsGateway,
    MailService,
    PushNotificationsService
  ],
  controllers: [AdminController],
})
export class AdminModule {}
