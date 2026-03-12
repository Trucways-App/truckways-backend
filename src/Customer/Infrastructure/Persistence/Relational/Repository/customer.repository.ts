import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from '../../customer-repository';
import { CustomerEntity } from '../Entity/customer.entity';
import { Repository } from 'typeorm';
import { Customer } from 'src/Customer/Domain/customer';
import { CustomerMapper } from '../Mapper/customer.mapper';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';

export class CustomerRelationalRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerEntityRepository: Repository<CustomerEntity>,
  ) {}

  async profile(customer: Customer): Promise<Customer> {
    const customerProfile = await this.customerEntityRepository.findOne({
      where: { customerID: customer.customerID },
      relations: ['my_cart'],
    });
    return customerProfile ? CustomerMapper.toDomain(customerProfile) : null;
  }

  async create(customer: Customer): Promise<Customer> {
    const persistenceCustomer = CustomerMapper.toPerisitence(customer);
    const savedCustomer =
      await this.customerEntityRepository.save(persistenceCustomer);
    return CustomerMapper.toDomain(savedCustomer);
  }

  async findByID(id: number): Promise<Customer> {
    const customer = await this.customerEntityRepository.findOne({
      where: { id: id },
      relations: [
        'my_orders',
        'my_orders.customer',
        'my_orders.bid',
        'my_orders.Rider',
        'my_orders.Rider.vehicle',
        'my_orders.items',
        'my_cart',
        'my_transaction',
      ],
    });
    return customer ? CustomerMapper.toDomain(customer) : null;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerEntityRepository.findOne({
      where: { email: email },
    });
    return customer ? CustomerMapper.toDomain(customer) : null;
  }

  async findbyPasswordResetToken(token: string): Promise<Customer> {
    const customer = await this.customerEntityRepository.findOne({
      where: { resetPasswordToken: token },
    });
    return customer ? CustomerMapper.toDomain(customer) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Customer[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.customerEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['my_orders'],
    });
    const wallets = result.map(CustomerMapper.toDomain);
    return { data: wallets, total };
  }

  async findCustomersForAnnouncement(): Promise<Customer[]> {
    const result = await this.customerEntityRepository.find({
      where: { isVerified: true },
      select: ['email', 'customerID', 'deviceToken'],
    });
    const wallets = result.map(CustomerMapper.toDomain);
    return wallets;
  }

  async update(id: number, customer: Partial<Customer>): Promise<Customer> {
    await this.customerEntityRepository.update(
      id,
      CustomerMapper.toPerisitence(customer as Customer),
    );
    const updatedCustomer = await this.customerEntityRepository.findOne({
      where: { id: id },
    });
    return CustomerMapper.toDomain(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    await this.customerEntityRepository.delete(id);
  }

  async save(customer: Customer): Promise<Customer> {
    const persistenceCustomer = CustomerMapper.toPerisitence(customer);
    const savedCustomer = await this.customerEntityRepository.save(
      persistenceCustomer,
      { reload: true },
    );

    return CustomerMapper.toDomain(savedCustomer);
  }

  async searchCustomer(
    searchDto: SearchDto,
  ): Promise<{ data: Customer[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.customerEntityRepository.createQueryBuilder('customer');

    if (keyword) {
      qb.where('customer.name ILIKE :keyword', { keyword: `%${keyword}%` });
      qb.orWhere('customer.customerID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      qb.orWhere('customer.email ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Sorting
    qb.orderBy(`customer.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [customers, total] = await qb.getManyAndCount();

    return { data: customers, total };
  }

  async customerCount():Promise<number>{
    return await this.customerEntityRepository.count()
  }
}
