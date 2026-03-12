import { NotificationsEntity } from "../shared-entities/notification.entity";

export interface NotificationListResponse {
    data: NotificationsEntity[];
    count: number;
    unreadCount: number;
    currentPage: number;
    totalPages: number;
  }