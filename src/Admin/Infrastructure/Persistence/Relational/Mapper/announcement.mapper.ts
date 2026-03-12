import { AnnouncementEntity } from '../Entity/announcement.entity';
import { Announcement } from 'src/Admin/Domain/announcement';

export class AnouncementMapper {
  static toDomain(raw: AnnouncementEntity): Announcement {
    const domainEntity = new Announcement();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.body = raw.body;
    domainEntity.announcementMedium = raw.announcementMedium;
    domainEntity.targetUser = raw.targetUser;
    domainEntity.createdAT = raw.createdAT;
    domainEntity.updatedAT = raw.updatedAT;
    return domainEntity;
  }

  static toPerisitence(domainEntity: Announcement): AnnouncementEntity {
    const persistenceEntity = new AnnouncementEntity();

    if (domainEntity.id && typeof domainEntity.id === 'number') {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.announcementMedium = domainEntity.announcementMedium;
    persistenceEntity.body = domainEntity.body;
    persistenceEntity.targetUser = domainEntity.targetUser
    persistenceEntity.updatedAT = domainEntity.updatedAT;
    persistenceEntity.createdAT = domainEntity.createdAT;
    return persistenceEntity;
  }
}
