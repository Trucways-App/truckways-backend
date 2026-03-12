import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './utils/shared-modules/notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm/typeorm-config.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './Auth/auth.module';
import { MailModule } from './mailer/mailer.module';
import { CustomerModule } from './Customer/customer.module';
import { RiderModule } from './Rider/rider.module';
import { OrderModule } from './Order/order.module';
import authConfig from './Auth/config/auth.config';
import appConfig from './config/app.config';
import { CloudinaryConfig } from './utils/cloudinary/cloudinary.config';
import { PaystackModule } from './utils/shared-modules/payment.module';
import { EventsGateway } from './utils/gateway/websocket.gateway';

import { WalletService } from './Rider/wallet/wallet.service';
import { AdminModule } from './Admin/admin.module';
import { JobsModule } from './jobs/jobs.module';


@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ConfigModule.forRoot({ isGlobal: true, load: [authConfig, appConfig] }),
    AuthModule,
    MailModule,
    CustomerModule,
    RiderModule,
    OrderModule,
    PaystackModule,
    AdminModule,
    JobsModule
   
  ],
  controllers: [AppController],
  providers: [AppService,CloudinaryConfig,EventsGateway],
  exports: [EventsGateway]
})
export class AppModule {}
