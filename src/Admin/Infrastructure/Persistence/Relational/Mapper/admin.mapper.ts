import { Customer } from 'src/Customer/Domain/customer';
import { AdminEntity,} from '../Entity/admin.entity';
import { Admin } from 'src/Admin/Domain/admin';

export class AdminMapper {
  static toDomain(raw: AdminEntity): Admin {
    const domainEntity = new Admin();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.deviceToken = raw.deviceToken;
    domainEntity.address = raw.address;
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password;
    domainEntity.profilePicture = raw.profilePicture;
    domainEntity.resetPasswordToken = raw.resetPasswordToken;
    domainEntity.resetPasswordTokenExpTime = raw.resetPasswordTokenExpTime;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.updatedAT = raw.updatedAT;
    domainEntity.adminID = raw.adminID;
    domainEntity.isVerified = raw.isVerified;
    domainEntity.role = raw.role;
    return domainEntity;
  }

  static toPerisitence(domainEntity: Admin): AdminEntity {
    const persistenceEntity = new AdminEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.deviceToken = domainEntity.deviceToken;
    persistenceEntity.adminID = domainEntity.adminID;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.isVerified = domainEntity.isVerified;
    persistenceEntity.profilePicture = domainEntity.profilePicture;
    persistenceEntity.resetPasswordToken = domainEntity.resetPasswordToken;
    persistenceEntity.resetPasswordTokenExpTime =
      domainEntity.resetPasswordTokenExpTime;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.createdAT = domainEntity.createdAT;
    return persistenceEntity;
  }
}
