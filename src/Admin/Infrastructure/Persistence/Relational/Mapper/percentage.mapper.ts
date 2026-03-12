
import { PercentageConfigEntity } from '../Entity/percentage-configuration.entity';
import { PercentageConfig } from 'src/Admin/Domain/percentage';

export class PercentageConfigMapper {
  static toDomain(raw: PercentageConfigEntity): PercentageConfig {
    const domainEntity = new PercentageConfig();
    domainEntity.id = raw.id;
    domainEntity.isActive = raw.isActive;
    domainEntity.percentage = raw.percentage;
    domainEntity.type = raw.type;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.updatedAT = raw.updatedAT;
    return domainEntity;
  }

  static toPerisitence(domainEntity: PercentageConfig): PercentageConfigEntity {
    const persistenceEntity = new PercentageConfigEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.percentage = domainEntity.percentage;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.createdAT = domainEntity.createdAT;
    return persistenceEntity;
  }
}
