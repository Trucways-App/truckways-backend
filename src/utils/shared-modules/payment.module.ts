import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomAxiosService } from 'src/Payment/paystack/custom.axios-service';
import { PayStackConfig } from 'src/Payment/paystack/paystack.config';
import { PaystackService } from 'src/Payment/paystack/paystack.service';
import { RelationalPersistenceRiderModule } from 'src/Rider/Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { WalletService } from 'src/Rider/wallet/wallet.service';
import { ResponseService } from '../services/response.service';
import { NotificationsService } from '../services/notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsEntity } from '../shared-entities/notification.entity';
import { GeneratorService } from '../services/generator.service';
import { JwtService } from '@nestjs/jwt';
import { RelationalPersistenceAdminModule } from 'src/Admin/Infrastructure/Persistence/Relational/relational-persistence-admin.module';
import { PersitenceRelationalOrderModule } from 'src/Order/Infrastructure/Persistence/Relational/persitence.relational.order.module';
import { PaystackWebhookService } from 'src/Payment/webhooks/webhook.service';
import { WebhookController } from 'src/Payment/webhooks/webhook.controller';

@Module({
  imports: [
    RelationalPersistenceRiderModule,
    RelationalPersistenceAdminModule,
    PersitenceRelationalOrderModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([NotificationsEntity]),
  ],
  providers: [
    PaystackService,
    CustomAxiosService,
    WalletService,
    ResponseService,
    NotificationsService,
    GeneratorService,
    JwtService,
    PaystackWebhookService,
    {
      provide: PayStackConfig,
      useFactory: () => PayStackConfig.fromEnv(),
    },
  ],
  controllers:[WebhookController],
  exports: [PayStackConfig, PaystackService, CustomAxiosService],
})
export class PaystackModule {}
