import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { GeneratorService } from 'src/utils/services/generator.service';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { ResponseService } from 'src/utils/services/response.service';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { PersitenceRelationalOrderModule } from './Infrastructure/Persistence/Relational/persitence.relational.order.module';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaystackService } from 'src/Payment/paystack/paystack.service';
import { CustomAxiosService } from 'src/Payment/paystack/custom.axios-service';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { RelationalPersistenceAdminModule } from 'src/Admin/Infrastructure/Persistence/Relational/relational-persistence-admin.module';
import { RelationalPersistenceRiderModule } from 'src/Rider/Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { WalletService } from 'src/Rider/wallet/wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationsEntity,RiderEntity]),
    PersitenceRelationalOrderModule,
    RelationalPersistenceAdminModule,
    RelationalPersistenceRiderModule
  ],
  providers: [
    ResponseService,
    NotificationsService,
    CloudinaryService,
    JwtService,
    GeneratorService,
    GeoLocationService,
    OrderService,
    PaystackService,
    CustomAxiosService,
    EventsGateway,
    PushNotificationsService,
    WalletService
  ],
  controllers: [OrderController],
})
export class OrderModule {}
