import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  constructor(
    @InjectRepository(RiderEntity)
    private readonly riderRepository: Repository<RiderEntity>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    // Check if Firebase app is already initialized to prevent multiple initializations
    if (!admin.apps.length) {
      try {
        // Get environment variables with ConfigService
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

        // Validate required Firebase credentials
        if (!projectId || !clientEmail || !privateKey) {
          console.error('Missing Firebase credentials. Check your environment variables:');
          console.error(`- FIREBASE_PROJECT_ID: ${projectId ? 'Set' : 'Missing'}`);
          console.error(`- FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Set' : 'Missing'}`);
          console.error(`- FIREBASE_PRIVATE_KEY: ${privateKey ? 'Set' : 'Missing'}`);
          return;
        }

        // Initialize Firebase Admin SDK
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firebase Admin SDK initialized successfully.');
      } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
      }
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<string> {
    // Check if Firebase is initialized
    if (!admin.apps.length) {
      throw new ServiceUnavailableException('Firebase Admin SDK not initialized.');
    }

    const message = {
      notification: {
        title,
        body,
      },
      token,
      data,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new ServiceUnavailableException(error);
    }
  }

  async sendNotificationToAllRiders(
    title: string,
    body: string,
    data?: any,
  ): Promise<{ successful: number; failed: number }> {
    try {
      // Get all active riders with FCM tokens
      const riders = await this.riderRepository.find({
        where: { 
          emailConfirmed: true,
          isAprroved: true,
          deviceToken: Not(IsNull()) 
        },
        select: ['riderID', 'deviceToken', 'name']
      });

      const tokens = riders.map(rider => rider.deviceToken).filter(Boolean);

      if (tokens.length === 0) {
        console.log('No active riders with valid FCM device tokens found');
        return { successful: 0, failed: 0 };
      }

      // Prepare the message for multiple recipients
      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens
      };

      try {
        // Send to multiple devices
        const response = await admin.messaging().sendEachForMulticast(message);
        
        console.log('Multicast messages sent:', {
          successful: response.successCount,
          failed: response.failureCount
        });

        // Handle failed tokens if necessary
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push({
                token: tokens[idx],
                error: resp.error
              });
            }
          });
          console.log('Failed tokens:', failedTokens);
        }

        return {
          successful: response.successCount,
          failed: response.failureCount
        };
      } catch (error) {
        console.error('Error sending multicast messages:', error);
        throw new ServiceUnavailableException(error);
      }
    } catch (error) {
      console.error('Error in sendNotificationToAllRiders:', error);
      throw new ServiceUnavailableException(error);
    }
  }

  // Helper method to send new order notification to all riders
  async notifyAllRidersOfNewOrder(order: OrderEntity): Promise<void> {
    const title = 'New Order Available!';
    const body = `New delivery order from ${order.items.map((add)=>add.pickup_address)} to ${order.items.map((add)=>add.dropoff_address)}`;
    
    const data = {
      orderID: order.orderID,
      type: 'new_order',
      initial_bid: order.items.map((add)=>add.initial_bid_value).toString(),
      pickup: order.items.map((add)=>add.pickup_address),
      dropoff: order.items.map((add)=>add.dropoff_address),
      timestamp: new Date().toISOString()
    };

    try {
      const result = await this.sendNotificationToAllRiders(title, body, data);
      console.log('New order notification sent to riders:', result);
    } catch (error) {
      console.error('Failed to notify riders of new order:', error);
      // Don't throw here to prevent order creation from failing
    }
  }

  async sendNotificationToTargetUsers(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<{ successful: number; failed: number }> {
    try {
      if (tokens.length === 0) {
        console.log('No valid FCM device tokens provided');
        return { successful: 0, failed: 0 };
      }

      // Prepare the message for multiple recipients
      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens
      };

      try {
        // Send to multiple devices
        const response = await admin.messaging().sendEachForMulticast(message);
        
        console.log('Multicast messages sent:', {
          successful: response.successCount,
          failed: response.failureCount
        });

        // Handle failed tokens if necessary
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push({
                token: tokens[idx],
                error: resp.error
              });
            }
          });
          console.log('Failed tokens:', failedTokens);
        }

        return {
          successful: response.successCount,
          failed: response.failureCount
        };
      } catch (error) {
        console.error('Error sending multicast messages:', error);
        throw new ServiceUnavailableException(error);
      }
    } catch (error) {
      console.error('Error in sendNotificationToTargetUsers:', error);
      throw new ServiceUnavailableException(error);
    }
  }
}