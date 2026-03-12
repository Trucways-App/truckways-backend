import { Module } from '@nestjs/common';
import { RelationalPersistenceRiderModule } from './Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { ResponseService } from 'src/utils/services/response.service';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { GeneratorService } from 'src/utils/services/generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import { PersitenceRelationalOrderModule } from 'src/Order/Infrastructure/Persistence/Relational/persitence.relational.order.module';
import { RiderService } from './rider.service';
import { RiderController } from './rider.controller';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderEntity } from './Infrastructure/Persistence/Relational/Entity/rider.entity';
import { WalletService } from './wallet/wallet.service';
import { WalletRepository } from './Infrastructure/Persistence/rider-repository';
import { WalletController } from './wallet/wallet.controller';
import { PaystackService } from 'src/Payment/paystack/paystack.service';
import { CustomAxiosService } from 'src/Payment/paystack/custom.axios-service';
import { RelationalPersistenceAdminModule } from 'src/Admin/Infrastructure/Persistence/Relational/relational-persistence-admin.module';

@Module({
  imports: [
    RelationalPersistenceRiderModule,
    PersitenceRelationalOrderModule,
    RelationalPersistenceAdminModule,
    TypeOrmModule.forFeature([NotificationsEntity,RiderEntity]),
  ],
  providers: [
    NotificationsService,
    ResponseService,
    CloudinaryService,
    GeneratorService,
    JwtService,
    GeoLocationService,
    RiderService,
    EventsGateway,
    WalletService,
    PaystackService,
    CustomAxiosService,
   PushNotificationsService

  ],
  controllers: [RiderController,WalletController],
})
export class RiderModule {}
