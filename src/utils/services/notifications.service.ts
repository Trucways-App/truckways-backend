import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity } from '../shared-entities/notification.entity';
import { CreateNotificationsDto } from '../shared-dto/notification.dto';
import { v4 as uuidv4 } from 'uuid';


interface NotificationResponse {
    notifications: NotificationsEntity[];
    count: number;
    unreadCount?: number;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }


@Injectable()
export class NotificationsService {
  constructor(
    
    @InjectRepository(NotificationsEntity)
    private readonly notificationsRepository: Repository<NotificationsEntity>,
  ) {}

  async create(dto: CreateNotificationsDto): Promise<NotificationsEntity> {
    try {
        const notificationId = `EHNOT${await uuidv4() }`;
      // Create the notification instance
      const notification = this.notificationsRepository.create({
        message: dto.message,
        subject: dto.subject || dto.message, // Added fallback to message if subject not provided
        account: dto.account,
        notificationID: notificationId,
        isRead: false,
      });

      // Save the notification to the database
      const savedNotification = await this.notificationsRepository.save(notification);

      return savedNotification;
    } catch (error) {
      // Add proper error handling
      console.error('Error creating notification:', {
        dto,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Optional: Helper method for creating multiple notifications at once
  async createMany(dtos: CreateNotificationsDto[]): Promise<NotificationsEntity[]> {
    try {
        const notificationId = `EHNOT${await uuidv4() }`;
      const notifications = this.notificationsRepository.create(
        dtos.map(dto => ({
          message: dto.message,
          subject: dto.subject || dto.message,
          account: dto.account,
          notificationID:notificationId,
          isRead: false,
        }))
      );

      const savedNotifications = await this.notificationsRepository.save(notifications);
      return savedNotifications;
    } catch (error) {
      console.error('Error creating multiple notifications:', {
        dtos,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to create notifications: ${error.message}`);
    }
  }


  async fetchAll(
    accountId: string,
    params?: PaginationParams,
  ): Promise<NotificationResponse> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 15;
      const skip = (page - 1) * limit;

      const [notifications, totalCount] = await this.notificationsRepository.findAndCount({
        where: { account: accountId },
        order: { date: 'DESC' },
        skip,
        take: limit,
      });

      // Get unread count
      const unreadCount = await this.notificationsRepository.count({
        where: { 
          account: accountId,
          isRead: false,
        },
      });

      return {
        notifications,
        count: totalCount,
        unreadCount,
      };
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }



  async fetchAllAdmin(
    params?: PaginationParams,
  ): Promise<NotificationResponse> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 15;
      const skip = (page - 1) * limit;

      const [notifications, totalCount] = await this.notificationsRepository.findAndCount({
        order: { date: 'DESC' },
        skip,
        take: limit,
      });

      // Get unread count
      const unreadCount = await this.notificationsRepository.count({
        where: { 
          isRead: false,
        },
      });

      return {
        notifications,
        count: totalCount,
        unreadCount,
      };
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }


  async markAsRead(notificationId: string, accountId: string): Promise<NotificationsEntity> {
    try {
      const notification = await this.notificationsRepository.findOne({
        where: { 
          notificationID: notificationId,
          account: accountId 
        }
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // Already read - no need to update
      if (notification.isRead) {
        return notification;
      }

      notification.isRead = true;
      notification.readAt = new Date();

      return await this.notificationsRepository.save(notification);
    } catch (error) {
      console.error('Error marking notification as read:', {
        notificationId,
        accountId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }


  async markAsReadAdmin(notificationId: string): Promise<NotificationsEntity> {
    try {
      const notification = await this.notificationsRepository.findOne({
        where: { 
          notificationID: notificationId,
         
        }
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // Already read - no need to update
      if (notification.isRead) {
        return notification;
      }

      notification.isRead = true;
      notification.readAt = new Date();

      return await this.notificationsRepository.save(notification);
    } catch (error) {
      console.error('Error marking notification as read:', {
        notificationId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }


  async markMultipleAsRead(notificationIds: string[], accountId: string): Promise<void> {
    try {
      await this.notificationsRepository
        .createQueryBuilder()
        .update(NotificationsEntity)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where('id IN (:...ids)', { ids: notificationIds })
        .andWhere('account = :accountId', { accountId })
        .execute();
    } catch (error) {
      console.error('Error marking multiple notifications as read:', {
        notificationIds,
        accountId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }



  async markMultipleAsReadAdmin(notificationIds: string[]): Promise<void> {
    try {
      await this.notificationsRepository
        .createQueryBuilder()
        .update(NotificationsEntity)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where('id IN (:...ids)', { ids: notificationIds })
        .execute();
    } catch (error) {
      console.error('Error marking multiple notifications as read:', {
        notificationIds,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }


  async markAllAsRead(accountId: string): Promise<void> {
    try {
      await this.notificationsRepository
        .createQueryBuilder()
        .update(NotificationsEntity)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where('account = :accountId', { accountId })
        .andWhere('isRead = :isRead', { isRead: false })
        .execute();
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        accountId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }


  async markAllAsReadAdmin(): Promise<void> {
    try {
      await this.notificationsRepository
        .createQueryBuilder()
        .update(NotificationsEntity)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .andWhere('isRead = :isRead', { isRead: false })
        .execute();
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
