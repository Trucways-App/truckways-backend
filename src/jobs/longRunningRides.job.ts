import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Rides } from 'src/Rider/Domain/rides';
import {
  RiderRepository,
  RidesRepository,
} from 'src/Rider/Infrastructure/Persistence/rider-repository';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';

@Injectable()
export class RideJobService {
  constructor(
    private readonly ridesRepository: RidesRepository,
    private readonly riderRepo: RiderRepository,
    private notificationService: NotificationsService,
    private pushNotificationService:PushNotificationsService
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleLongRunningRides() {
    try {
      console.log('Running job: handleLongRunningRides');
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const ongoingRides =
        await this.ridesRepository.findLongRunningRides(fourHoursAgo);

      for (const ride of ongoingRides) {
        if (!ride.reminderSent) {
          await this.sendReminderNotification(ride);
          ride.reminderSent = true;
          await this.ridesRepository.save(ride);
        }
      }

      console.log('Running Job: Sent ride taking so long reminder');
    } catch (error) {
      console.error('Long-running ride check failed:', error);
    }
  }

  private async sendReminderNotification(ride: Rides) {
    try {
      // Send notification to rider
      await this.notificationService.create({
        subject: 'Ride Status Reminder',
        message:
          `Your ride ${ride.ridesID} has been ongoing for 4 hours. ` +
          'Please ensure to complete the ride to receive your remaining balance. ' +
          'Reply HELP if you need assistance.',
        account: ride.rider.riderID,
      });

      //send push notifications
      const rider = await this.riderRepo.findByID(ride.rider.id);

      if (!rider?.deviceToken) {
        console.warn(`No device token for rider ${ride.rider.riderID}`);
        return;
      }

        await this.pushNotificationService.sendPushNotification(
          rider.deviceToken,
          'Ride Status Reminder 🚚',
          `Your ride #${ride.ridesID.slice(-6)} has been ongoing for 4+ hours. ` +
          'Complete the ride to receive your full payment. Need help? Tap to contact support.',
          {
            type: 'ride_reminder',
            rideId: ride.ridesID,
            timestamp: new Date().toISOString()
          }
        );
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  }
}
