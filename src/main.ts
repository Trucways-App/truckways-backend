import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ResponseSyncInterceptor } from './utils/interceptors/custom.nest.interceptor';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AllConfigType } from './config/config-type';
import { Customer } from './Customer/Domain/customer';
import { Rider } from './Rider/Domain/rider';
import { Vehicle } from './Rider/Domain/vehicle';
import { Bank } from './Rider/Domain/bank';
import { Wallet } from './Rider/Domain/wallet';
import { Order } from './Order/Domain/order';
import { OrderCart } from './Order/Domain/order-cart';
import { CartItem, Ordertem } from './Order/Domain/order-cart-items';
import { NotificationsEntity } from './utils/shared-entities/notification.entity';
import { OtpEntity } from './utils/shared-entities/otp.entity';
import { Bid } from './Order/Domain/bids';
import { Transactions } from './Rider/Domain/transaction';
import { Rides } from './Rider/Domain/rides';
import { Admin } from './Admin/Domain/admin';
import { PercentageConfig } from './Admin/Domain/percentage';
import { RiderBidResponse } from './Order/Domain/bidResponse';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService<AllConfigType>);
  app.enableShutdownHooks();

  // app.setGlobalPrefix(
  //   configService.getOrThrow('app.apiPrefix', { infer: true }),
  //   { exclude: ['/'] },
  // );

  app.setGlobalPrefix('api/v1/truckways/', { exclude: ['/'] });
  
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseSyncInterceptor());

  const config = new DocumentBuilder()
    .setTitle('TRUCKWAYS')
    .setDescription('Official Api Documemtation For Truckways')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const options: SwaggerDocumentOptions = {
    extraModels: [
      Customer,
      Rider,
      Vehicle,
      Bank,
      Wallet,
      Order,
      OrderCart,
      CartItem,
      Ordertem,
      NotificationsEntity,
      OtpEntity,
      Bid,
      Transactions,
      Admin,
      Rides,
      PercentageConfig,
      RiderBidResponse
      
      
    ],
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
