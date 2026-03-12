import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationalPersistenceCustomerModule } from 'src/Customer/Infrastructure/Persistence/Relational/relational-persistence-customer.module';
import { RelationalPersistenceRiderModule } from 'src/Rider/Infrastructure/Persistence/Relational/relational-persistence-rider.module';
import { MailService } from 'src/mailer/mailer.service';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { ResponseService } from 'src/utils/services/response.service';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { OtpEntity } from 'src/utils/shared-entities/otp.entity';
import { JwtGuard } from './Guard/jwt.guard';
import { JwtStrategy } from './Strategy/jwt.strategy';
import { CustomerAuthService } from './services/customer.auth.service';
import { CustomerAuthController } from './controllers/customer.auth.controller';
import { JwtService } from '@nestjs/jwt';
import { GeneratorService } from 'src/utils/services/generator.service';
import { RiderAuthService } from './services/rider.auth.service';
import { RiderAuthController } from './controllers/rider.auth.controller';
import { PersitenceRelationalOrderModule } from 'src/Order/Infrastructure/Persistence/Relational/persitence.relational.order.module';
import { RoleGuard } from './Guard/role.guard';
import { AdminAuthService } from './services/admin.auth.service';
import { AdminAuthController } from './controllers/admin.auth.controller';
import { RelationalPersistenceAdminModule } from 'src/Admin/Infrastructure/Persistence/Relational/relational-persistence-admin.module';

@Module({
  imports: [
    
    PersitenceRelationalOrderModule,
    RelationalPersistenceCustomerModule,
    RelationalPersistenceRiderModule,
    RelationalPersistenceAdminModule,
    TypeOrmModule.forFeature([NotificationsEntity, OtpEntity]),
  ],
  providers: [
    NotificationsService,
    ResponseService,
    MailService,
    JwtGuard,
    RoleGuard,
    JwtStrategy,
    CustomerAuthService,
    RiderAuthService,
    AdminAuthService,
    GeneratorService,
    JwtService,
  ],
  controllers: [CustomerAuthController, RiderAuthController,AdminAuthController],
})
export class AuthModule {}
