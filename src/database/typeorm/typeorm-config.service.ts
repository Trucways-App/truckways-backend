import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { OtpEntity } from 'src/utils/shared-entities/otp.entity';
import { OrderEntity, OrderItemsEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { OrderCartEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order-cart.entity';
import { CartItemsEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order-cart-items.entity';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';
import { WalletEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/wallet.entity';
import { BankEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/bank.entity';
import { BidEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bids.entity';
import { VehicleEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/vehicle.entity';
import { TransactionEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/transaction.entity';
import { AdminEntity } from 'src/Admin/Infrastructure/Persistence/Relational/Entity/admin.entity';
import { RidesEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rides.entity';
import { PercentageConfigEntity } from 'src/Admin/Infrastructure/Persistence/Relational/Entity/percentage-configuration.entity';
import { AnnouncementEntity } from 'src/Admin/Infrastructure/Persistence/Relational/Entity/announcement.entity';
import { RiderBidResponseEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bidResponse.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('DATABASE_TYPE', { infer: true }),
      host: this.configService.get('DATABASE_HOST', { infer: true }),
      port: this.configService.get('DATABASE_PORT', { infer: true }),
      username: this.configService.get('DATABASE_USERNAME', { infer: true }),
      password: this.configService.get('DATABASE_PASSWORD', { infer: true }),
      database: this.configService.get('DATABASE_NAME', { infer: true }),
      synchronize: this.configService.get('DATABASE_SYNCHRONIZE', {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [
        NotificationsEntity,
        OtpEntity,
        OrderEntity,
        OrderCartEntity,
        OrderItemsEntity,
        CartItemsEntity,
        RiderEntity,
        CustomerEntity,
        WalletEntity,
        BankEntity,
        BidEntity,
        VehicleEntity,
        TransactionEntity,
        AdminEntity,
        RidesEntity,
        PercentageConfigEntity,
        AnnouncementEntity,
        RiderBidResponseEntity
        
      
      ],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src',

        subscribersDir: 'subscriber',
      },
      extra: {
        // based on https://node-postgres.com/apis/pool
        // max connection pool size
        max: this.configService.get('DATABASE_MAX_CONNECTIONS', {
          infer: true,
        }),
        ssl: this.configService.get('DATABASE_SSL_ENABLE', { infer: true })
          ? {
              rejectUnauthorized: this.configService.get(
                'DATABASE_REJECT_UNAUTHORIZED',
                { infer: true },
              ),
              ca:
                this.configService.get('DATABASE_CA', { infer: true }) ??
                undefined,
              key:
                this.configService.get('DATABASE_KEY', { infer: true }) ??
                undefined,
              cert:
                this.configService.get('DATABASE_CERT', { infer: true }) ??
                undefined,
            }
          : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
