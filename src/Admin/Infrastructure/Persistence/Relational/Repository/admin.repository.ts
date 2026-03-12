import { InjectRepository } from '@nestjs/typeorm';
import { AdminRepository, AnnounceRepository, PercentageConfigRepository} from '../../admin-repository';
import { AdminEntity } from '../Entity/admin.entity';
import { Repository } from 'typeorm';
import { AdminMapper } from '../Mapper/admin.mapper';
import { Admin } from 'src/Admin/Domain/admin';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';
import { PercentageConfigEntity } from '../Entity/percentage-configuration.entity';
import { PercentageConfig } from 'src/Admin/Domain/percentage';
import { PercentageConfigMapper } from '../Mapper/percentage.mapper';
import { PercentageType } from 'src/Enums/percentage.enum';
import { AnnouncementEntity } from '../Entity/announcement.entity';
import { Announcement } from 'src/Admin/Domain/announcement';
import { AnouncementMapper } from '../Mapper/announcement.mapper';
import { AnnonuncmentTargetUser, AnnouncementMeduim } from 'src/Enums/announcement.enum';

export class AdminRelationalRepository implements AdminRepository {
  constructor(
    @InjectRepository(AdminEntity)
    private adminEntityRepository: Repository<AdminEntity>,
  ) {}

  async profile(admin: Admin): Promise<Admin> {
    const customerProfile = await this.adminEntityRepository.findOne({
      where: { adminID: admin.adminID},
    });
    return customerProfile ? AdminMapper.toDomain(customerProfile) : null;
  }

  async create(customer: Admin): Promise<Admin> {
    const persistenceCustomer = AdminMapper.toPerisitence(customer);
    const savedCustomer =
      await this.adminEntityRepository.save(persistenceCustomer);
    return AdminMapper.toDomain(savedCustomer);
  }

  async findByID(id: number): Promise<Admin> {
    const customer = await this.adminEntityRepository.findOne({
      where: { id: id },
    });
    return customer ? AdminMapper.toDomain(customer) : null;
  }

  async findByEmail(email: string): Promise<Admin> {
    const customer = await this.adminEntityRepository.findOne({
      where: { email: email },
    });
    return customer ? AdminMapper.toDomain(customer) : null;
  }

  async findbyPasswordResetToken(token: string): Promise<Admin> {
    const customer = await this.adminEntityRepository.findOne({
      where: { resetPasswordToken: token },
    });
    return customer ? AdminMapper.toDomain(customer) : null;
  }

  async find(dto: PaginationDto): Promise<{ data: Admin[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.adminEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    
    });
    const wallets = result.map(AdminMapper.toDomain);
    return { data: wallets, total };
  }

  async update(id: number, customer: Partial<Admin>): Promise<Admin> {
    await this.adminEntityRepository.update(
      id,
      AdminMapper.toPerisitence(customer as Admin),
    );
    const updatedCustomer = await this.adminEntityRepository.findOne({
      where: { id: id },
    });
    return AdminMapper.toDomain(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    await this.adminEntityRepository.delete(id);
  }

  async save(customer: Admin): Promise<Admin> {
    const persistenceCustomer = AdminMapper.toPerisitence(customer);
    const savedCustomer = await this.adminEntityRepository.save(
      persistenceCustomer,
      { reload: true },
    );

    return AdminMapper.toDomain(savedCustomer);
  }



  async searchAdmin(
    searchDto: SearchDto,
  ): Promise<{ data: Admin[]; total: number }> {
    const { keyword, page, Perpage, sort, sortOrder } = searchDto;

    const qb = this.adminEntityRepository.createQueryBuilder('admin');

    if (keyword) {
      qb.where('admin.name ILIKE :keyword', { keyword: `%${keyword}%` });
      qb.orWhere('admin.adminID ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      qb.orWhere('admin.email ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // Sorting
    qb.orderBy(`admin.${sort}`, sortOrder);

    // Pagination
    if (page && Perpage) {
      qb.skip((page - 1) * Perpage).take(Perpage);
    }

    // Execute the query
    const [admins, total] = await qb.getManyAndCount();

    return { data: admins, total };
  }
}





//percentage 
export class PercentageConfigRelationalRepository implements PercentageConfigRepository {
  constructor(
    @InjectRepository(PercentageConfigEntity)
    private percentageEntityRepository: Repository<PercentageConfigEntity>,
  ) {}



  async create(customer: PercentageConfig): Promise<PercentageConfig> {
    const persistenceCustomer = PercentageConfigMapper.toPerisitence(customer);
    const savedCustomer =
      await this.percentageEntityRepository.save(persistenceCustomer);
    return PercentageConfigMapper.toDomain(savedCustomer);
  }

  async findByID(id: number): Promise<PercentageConfig> {
    const customer = await this.percentageEntityRepository.findOne({
      where: { id: id },
    });
    return customer ? PercentageConfigMapper.toDomain(customer) : null;
  }

  async findByType(type:PercentageType): Promise<PercentageConfig> {
    const customer = await this.percentageEntityRepository.findOne({
      where: { type:type },
    });
    return customer ? PercentageConfigMapper.toDomain(customer) : null;
  }



  async find(dto: PaginationDto): Promise<{ data: PercentageConfig[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.percentageEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      
    });
    const wallets = result.map(PercentageConfigMapper.toDomain);
    return { data: wallets, total };
  }

  async update(id: number, customer: Partial<PercentageConfig>): Promise<PercentageConfig> {
    await this.percentageEntityRepository.update(
      id,
      PercentageConfigMapper.toPerisitence(customer as PercentageConfig),
    );
    const updatedCustomer = await this.percentageEntityRepository.findOne({
      where: { id: id },
    });
    return PercentageConfigMapper.toDomain(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    await this.percentageEntityRepository.delete(id);
  }

  async save(customer: PercentageConfig): Promise<PercentageConfig> {
    const persistenceCustomer = PercentageConfigMapper.toPerisitence(customer);
    const savedCustomer = await this.percentageEntityRepository.save(
      persistenceCustomer,
      { reload: true },
    );

    return PercentageConfigMapper.toDomain(savedCustomer);
  }

}





//announcement
export class AnnouncenentRelationalRepository implements AnnounceRepository {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private announcementEntityRepository: Repository<AnnouncementEntity>,
  ) {}



  async create(customer: Announcement): Promise<Announcement> {
    const persistenceCustomer = AnouncementMapper.toPerisitence(customer);
    const savedCustomer =
      await this.announcementEntityRepository.save(persistenceCustomer);
    return AnouncementMapper.toDomain(savedCustomer);
  }

  async findByID(id: number): Promise<Announcement> {
    const customer = await this.announcementEntityRepository.findOne({
      where: { id: id },
    });
    return customer ? AnouncementMapper.toDomain(customer) : null;
  }

  async findByMedium(medium:AnnouncementMeduim): Promise<Announcement> {
    const customer = await this.announcementEntityRepository.findOne({
      where: { announcementMedium:medium },
    });
    return customer ? AnouncementMapper.toDomain(customer) : null;
  }

  async findBytargetUser(user:AnnonuncmentTargetUser): Promise<Announcement> {
    const customer = await this.announcementEntityRepository.findOne({
      where: { targetUser:user },
    });
    return customer ? AnouncementMapper.toDomain(customer) : null;
  }



  async find(dto: PaginationDto): Promise<{ data: Announcement[]; total: number }> {
    const { page, limit, sortBy, sortOrder } = dto;
    const [result, total] = await this.announcementEntityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      
    });
    const wallets = result.map(AnouncementMapper.toDomain);
    return { data: wallets, total };
  }

  async update(id: number, customer: Partial<Announcement>): Promise<Announcement> {
    await this.announcementEntityRepository.update(
      id,
      AnouncementMapper.toPerisitence(customer as Announcement),
    );
    const updatedCustomer = await this.announcementEntityRepository.findOne({
      where: { id: id },
    });
    return AnouncementMapper.toDomain(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    await this.announcementEntityRepository.delete(id);
  }

  async save(customer: Announcement): Promise<Announcement> {
    const persistenceCustomer = AnouncementMapper.toPerisitence(customer);
    const savedCustomer = await this.announcementEntityRepository.save(
      persistenceCustomer,
      { reload: true },
    );

    return AnouncementMapper.toDomain(savedCustomer);
  }

}





