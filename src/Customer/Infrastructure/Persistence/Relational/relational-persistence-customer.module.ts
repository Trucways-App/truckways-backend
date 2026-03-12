import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './Entity/customer.entity';
import { CustomerRelationalRepository } from './Repository/customer.repository';
import { CustomerRepository } from '../customer-repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [
    {
      provide: CustomerRepository,
      useClass: CustomerRelationalRepository,
    },
  ],
  exports:[CustomerRepository]
})
export class RelationalPersistenceCustomerModule {}
