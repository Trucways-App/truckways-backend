import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BankRepository,
  RiderRepository,
  RidesRepository,
  TransactionRepository,
  VehicleRepository,
  WalletRepository,
} from './Infrastructure/Persistence/rider-repository';
import {
  ResponseService,
  StandardResponse,
} from 'src/utils/services/response.service';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import { RiderEntity } from './Infrastructure/Persistence/Relational/Entity/rider.entity';
import { Rider } from './Domain/rider';
import { updateRiderProfileDto } from './Dto/update-rider.dto';
import { Multer } from 'multer';
import { VehicleDto } from './Dto/vehicle-profile.dto';
import { Vehicle } from './Domain/vehicle';
import { GeneratorService } from 'src/utils/services/generator.service';
import { BankDto } from './Dto/payment-profile.dto';
import { Bank } from './Domain/bank';
import { NotificationListResponse } from 'src/utils/Types/notification.responsetypes';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { markMultipleNotificationsAsReadDto } from 'src/utils/shared-dto/notification.dto';
import {
  BidRepository,
  OrderItemRepository,
  OrderRepository,
  RiderBidResponseRepository,
} from 'src/Order/Infrastructure/Persistence/all-order-repositories';
import { PaginationDto } from 'src/utils/shared-dto/pagination.dto';
import { Bid } from 'src/Order/Domain/bids';
import {
  BidActionDto,
  CounterBidDto,
} from 'src/utils/shared-dto/bid-action.dto';
import {
  BidAction,
  BidActionResult,
  BidStatus,
  BidTypeAccepted,
  OrderStatus,
  PaymentStatus,
  RideStatus,
  RiderMileStones,
} from 'src/Enums/order.enum';
import { BidEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bids.entity';
import { Order } from 'src/Order/Domain/order';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { Rides } from './Domain/rides';
import { CancelRideDto, DropOffCodeDto } from './Dto/dropOff-code.dto';
import { OnboardingAction, RiderStatus } from 'src/Enums/users.enum';
import { WalletService } from './wallet/wallet.service';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderBidResponseStatus } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bidResponse.entity';
import { RiderBidResponse } from 'src/Order/Domain/bidResponse';
import { Not } from 'typeorm';
import { Transactions } from './Domain/transaction';
@Injectable()
export class RiderService {
  constructor(
    private riderRepository: RiderRepository,
    private orderRepository: OrderRepository,
    private orderItemRepo: OrderItemRepository,
    private bankRepository: BankRepository,
    private walletRepository: WalletRepository,
    private riderBidResponseRepository:RiderBidResponseRepository,
    private vehicleRepository: VehicleRepository,
    private  transactionRepository: TransactionRepository,
    private responseService: ResponseService,
    private cloudinaryService: CloudinaryService,
    private notificationsService: NotificationsService,
    private geolocationService: GeoLocationService,
    private generatorService: GeneratorService,
    private bidRepository: BidRepository,
    private readonly eventsGateway: EventsGateway,
    private ridesRepo: RidesRepository,
    private walletService:WalletService,
    private readonly pushNotificationService:PushNotificationsService
  ) {}

  //notifications

  async fetchAllNotifications(
    rider: RiderEntity,
    query?: { page?: number; limit?: number },
  ): Promise<StandardResponse<NotificationListResponse>> {
    try {
      if (!rider?.riderID) {
        return this.responseService.badRequest('Invalid rider ID provided');
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 10;

      const { notifications, count, unreadCount } =
        await this.notificationsService.fetchAll(rider.riderID, {
          page,
          limit,
        });

      const totalPages = Math.ceil(count / limit);

      const response: NotificationListResponse = {
        data: notifications,
        count,
        unreadCount,
        currentPage: page,
        totalPages,
      };

      return this.responseService.success(
        notifications.length
          ? 'Notifications retrieved successfully'
          : 'No notifications found for this rider',
        response,
      );
    } catch (error) {
      const errorMessage = error?.message || 'Unknown error occurred';

      // Log the error for debugging
      console.error('Notification fetch error:', {
        planner: rider.riderID,
        error: errorMessage,
        stack: error?.stack,
      });

      return this.responseService.internalServerError(
        'Error while fetching notifications',
        errorMessage,
      );
    }
  }

  async markNotificationAsRead(
    rider: RiderEntity,
    notificationId: string,
  ): Promise<StandardResponse<NotificationsEntity>> {
    try {
      if (!rider?.riderID) {
        return this.responseService.badRequest('Invalid rider ID provided');
      }

      const updatedNotification = await this.notificationsService.markAsRead(
        notificationId,
        rider.riderID,
      );

      return this.responseService.success(
        'Notification marked as read successfully',
        updatedNotification,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.responseService.notFound(error.message);
      }

      console.error('Error marking notification as read:', {
        customer: rider.riderID,
        notificationId,
        error: error.message,
        stack: error.stack,
      });

      return this.responseService.internalServerError(
        'Error marking notification as read',
        error.message,
      );
    }
  }

  async markMultipleNotificationsAsRead(
    rider: RiderEntity,
    dto: markMultipleNotificationsAsReadDto,
  ): Promise<StandardResponse<void>> {
    try {
      if (!rider?.riderID) {
        return this.responseService.badRequest('Invalid rider ID provided');
      }

      if (
        !Array.isArray(dto.notificationIds) ||
        dto.notificationIds.length === 0
      ) {
        return this.responseService.badRequest(
          'Please provide valid notification IDs',
        );
      }

      await this.notificationsService.markMultipleAsRead(
        dto.notificationIds,
        rider.riderID,
      );

      return this.responseService.success(
        'Notifications marked as read successfully',
      );
    } catch (error) {
      console.error('Error marking multiple notifications as read:', {
        customer: rider.riderID,
        dto,
        error: error.message,
        stack: error.stack,
      });

      return this.responseService.internalServerError(
        'Error marking notifications as read',
        error.message,
      );
    }
  }

  async markAllNotificationsAsRead(
    rider: RiderEntity,
  ): Promise<StandardResponse<void>> {
    try {
      if (!rider?.riderID) {
        return this.responseService.badRequest('Invalid riderID provided');
      }

      await this.notificationsService.markAllAsRead(rider.riderID);

      return this.responseService.success(
        'All notifications marked as read successfully',
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        customer: rider.riderID,
        error: error.message,
        stack: error.stack,
      });

      return this.responseService.internalServerError(
        'Error marking all notifications as read',
        error.message,
      );
    }
  }

  //onboarding

  async PersonalProfile(
    rider: RiderEntity,
    dto: updateRiderProfileDto,
    mediafile: Express.Multer.File[],
  ): Promise<StandardResponse<Rider>> {
    try {
      const fileUploadPromises = mediafile.map((file) =>
        this.cloudinaryService.uploadFile(file),
      );

      const uploadResults = await Promise.all(fileUploadPromises);
      const profilePicture = uploadResults[0].secure_url;
      const driverlicencefront = uploadResults[1].secure_url;
      const driverlicenceback = uploadResults[2].secure_url;

      // Create a copy of the rider without the address first
      const { address: _, ...RiderWithoutAddress } = rider;

      // Create base update object
      const updateObject: any = {
        ...RiderWithoutAddress,
        ...dto,
        profilePicture: profilePicture,
        driversLicenceFront: driverlicencefront,
        driversLicenceBack: driverlicenceback,
        updatedAT: new Date(),
        onboardingAction : OnboardingAction.PERSONAL_PROFILE,
        onboardingStatus :{ ...rider.onboardingStatus, 
          Vehicle_Profile:rider.onboardingStatus?.Vehicle_Profile || false,
          Personal_Profile: true,
          Payment_Profile:rider.onboardingStatus?.Payment_Profile ||false
  
        },
        onboardingPercentage : Math.min(
          Number(rider.onboardingPercentage || 0) + 35,
          100,
        )
      
      };

      // Handle address update
      if (dto.address) {
        try {
          const addressCoordinates =
            await this.geolocationService.getYahooCoordinates(dto.address);
          updateObject.address = {
            address: dto.address,
            lat: addressCoordinates.lat,
            lon: addressCoordinates.lon,
          };
        } catch (error) {
          console.error(error);
          return this.responseService.badRequest('Failed to geocode address');
        }
      } else if (rider.address) {
        // Keep existing address if no new address provided
        updateObject.address = rider.address;
      }

      // Perform the update
      await this.riderRepository.save(updateObject);

      // Fetch the updated customer to return the latest data
      const updatedRider = await this.riderRepository.findByID(rider.id);

      // Save notification
      await this.notificationsService.create({
        message: `${updatedRider.name} has updated their record.`,
        subject: 'Account Updated',
        account: updatedRider.riderID,
      });

      return this.responseService.success(
        'Rider record updated successfully',
        updatedRider,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error providing Personal Profile',
      );
    }
  }

  async VehicleProfile(
    rider: RiderEntity,
    dto: VehicleDto,
    mediafile: Express.Multer.File[],
  ): Promise<StandardResponse<Vehicle>> {
    try {

      const truueRider = await this.riderRepository.findByID(rider.id);
      if (!truueRider) return this.responseService.notFound('Rider not found');

      const fileUploadPromises = mediafile.map((file) =>
        this.cloudinaryService.uploadFile(file),
      );

      const uploadResults = await Promise.all(fileUploadPromises);
      const vehiclePictureurl = uploadResults[0].secure_url;
      const vehicleDocumentsurl = uploadResults[1].secure_url;

      const vehicleIdcustom = `TrkRV${await this.generatorService.generateUserID()}`;

      const vehicle = await this.vehicleRepository.save({
        id: 0,
        vehicleID: vehicleIdcustom,
        plateNumber: dto.plateNumber,
        vehicleDocuments: vehicleDocumentsurl,
        vehicleType: dto.vehicleType,
        vehiclePicture: vehiclePictureurl,
        createdAT: new Date(),
        updatedAT: undefined,
        owner: truueRider,
      });

      rider.vehicle = rider.vehicle
      ? [...rider.vehicle, vehicle]
      : [vehicle];

      rider.onboardingAction = OnboardingAction.VEHICLE_PROFILE;
      rider.onboardingStatus ={ ...rider.onboardingStatus, 
        Vehicle_Profile:true,
        Personal_Profile: rider.onboardingStatus?.Personal_Profile || false,
        Payment_Profile:rider.onboardingStatus?.Payment_Profile ||false

      };
      rider.onboardingPercentage = Math.min(
        Number(rider.onboardingPercentage || 0) + 35,
        100,
      );
      await this.riderRepository.save(rider)

      // Save notification
      await this.notificationsService.create({
        message: `${rider.name} has updated their vehicle profile`,
        subject: 'Vehicle Profile Updated',
        account: rider.riderID,
      });

      return this.responseService.success(
        'Rider vehicle Profile updated successfully',
        vehicle,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error providing Vehicle Profile',
      );
    }
  }

  async PaymentProfile(
    rider: RiderEntity,
    dto: BankDto,
  ): Promise<StandardResponse<Bank>> {
    try {

      const truueRider = await this.riderRepository.findByID(rider.id);
      if (!truueRider) return this.responseService.notFound('Rider not found');

      const bankIdcustom = `TrkRB${await this.generatorService.generateUserID()}`;

      const bank = await this.bankRepository.save({
        id: 0,
        bankID: bankIdcustom,
        bankName: dto.bankName,
        accountName: dto.accountName,
        accountNumber: dto.accountNumber,
        createdAT: new Date(),
        updatedAT: undefined,
        owner: truueRider,
      });

      rider.bank_details = rider.bank_details
      ? [...rider.bank_details, bank]
      : [bank];

     rider.updatedAT = new Date();
      rider.onboardingAction = OnboardingAction.PAYMENT_PROFILE;
      rider.onboardingStatus ={ ...rider.onboardingStatus, 
        Vehicle_Profile:rider.onboardingStatus?.Vehicle_Profile || false,
        Personal_Profile: rider.onboardingStatus?.Personal_Profile || false,
        Payment_Profile:true

      };
      rider.onboardingPercentage = Math.min(
        Number(rider.onboardingPercentage || 0) + 30,
        100,
      );
      await this.riderRepository.save(rider)

      // Save notification
      await this.notificationsService.create({
        message: `${rider.name} has updated their Payment profile`,
        subject: 'Payment Profile Updated',
        account: truueRider.riderID,
      });

      return this.responseService.success(
        'Rider Payment Profile updated successfully',
        bank,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error providing payment Profile',
      );
    }
  }

  async FetchallbidsFromcustomer(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Bid[]; total: number }>> {
    try {
      const { data: bids, total } = await this.bidRepository.fetchALL(dto);

      return this.responseService.success(
        bids.length ? 'Bids retrived successfully' : 'No bids yet',
        {
          data: bids,
          total,
          currentPage: dto.page,
          pageSize: dto.limit,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error fetching bids',
        error.message,
      );
    }
  }

  async FetchallMyInvolvedBids(
    rider: RiderEntity,
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Bid[]; total: number }>> {
    try {
      const { data: bids, total } = await this.bidRepository.fetchALLRider(
        dto,
        rider.riderID,
      );

      return this.responseService.success(
        bids.length ? 'Bids retrived successfully' : 'No bids yet',
        {
          data: bids,
          total,
          currentPage: dto.page,
          pageSize: dto.limit,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error fetching bids',
        error.message,
      );
    }
  }

  //fetch one bid by id
  async FetchOneBid(bidId: string): Promise<StandardResponse<Bid>> {
    try {
      const bid = await this.bidRepository.findByID(bidId);
      if (!bid) return this.responseService.notFound('Bid not found');

      return this.responseService.success(
        'single bid retrieved successfully',
        bid,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one bid',
        error.message,
      );
    }
  }

  //biding action

  async RiderAcceptOrDeclineBid(
    rider: RiderEntity,
    bidId: string,
    dto: BidActionDto,
  ): Promise<StandardResponse<BidActionResult>> {
    try {
      const bid = await this.bidRepository.findByID(bidId);

      if (!bid) {
        return this.responseService.notFound('Bid not found');
      }

      if (bid.bidStatus !== BidStatus.BID_SENT) {
        return this.responseService.badRequest(
          'This Bid is no longer Available',
        );
      }

      const existingResponse = await this.riderBidResponseRepository.findByRiderAndBid(
        rider.riderID, bid.bidID
      )

      if (existingResponse && existingResponse.status !== RiderBidResponseStatus.NO_RESPONSE) {
        return this.responseService.badRequest(
          'You have already responded to this bid'
        );
      }

      //create or update  rider's reponse to this bid 
      const responseID = existingResponse?.responseID || `TrkR${await this.generatorService.generateUserID()}`;


      const action = dto.doYouAccept ? BidAction.ACCEPT : BidAction.DECLINE;


      if (action === BidAction.ACCEPT) {
        // Start WebSocket conversation between rider and customer
        this.eventsGateway.startconversation(
          bid.order.orderID,
          rider.riderID,
          bid.order.customer.customerID,
        );
        
        // Process acceptance
        const result = await this.processAcceptBid(bid, rider, existingResponse, responseID);
        return this.responseService.success(result.message, {
          success: result.success,
          message: result.message,
        });
      } else {
        // Process decline
        const result = await this.processDeclineBid(bid, rider, existingResponse, responseID);
        return this.responseService.success(result.message, {
          success: result.success,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('RiderAcceptOrDeclineBid error:', error);
      return this.responseService.internalServerError(
        'Error performing bid action',
        error.message,
      );
    }
  }


  private async processAcceptBid(
    bid: BidEntity,
    rider: RiderEntity,
    existingResponse: RiderBidResponse | undefined,
    responseID: string,
  ): Promise<BidActionResult> {
    // Update rider's response to ACCEPTED
    if (existingResponse) {
      await this.riderBidResponseRepository.update(existingResponse.id, {
        status: RiderBidResponseStatus.ACCEPTED,
        respondedAt: new Date(),
      });
    } else {
      await this.riderBidResponseRepository.create({
        responseID: responseID,
        rider: rider,
        bid: bid,
        status: RiderBidResponseStatus.ACCEPTED,
        respondedAt: new Date(),
        isVisible: true,
        id: 0
      });
     
    }
  
    // Update the bid itself
    await this.bidRepository.update(bid.id, {
      bidStatus: BidStatus.BID_ACCEPTED,
      bidTypeAccepted: BidTypeAccepted.INITIAL,
      acceptedAT: new Date(),
      rider: rider,
    });
  
    // Update the order
    const order = await this.orderRepository.findByID(bid.order.orderID);
    order.accepted_bid = bid.initialBid_value;
    order.Rider = rider;
    await this.orderRepository.save(order);
  
   // Hide this bid from all other riders
   await this.hideOtherRiderBids(bid.bidID, rider.riderID);
  
    // Create a ride
    const ridesID = `TrkRd${await this.generatorService.generateUserID()}`;
    await this.ridesRepo.create({
      id: 0,
      ridesID: ridesID,
      milestone: undefined,
      status: RideStatus.PENDING,
      rider: rider,
      order: order,
      checkpointStatus: undefined,
      at_dropoff_locationAT: undefined,
      at_pickup_locationAT: undefined,
      enroute_to_dropoff_locationAT: undefined,
      enroute_to_pickup_locationAT: undefined,
      dropped_off_parcelAT: undefined,
      reason_for_cancelling_ride: '',
      isCancelled: false,
      cancelledAt: undefined,
      picked_up_parcelAT: undefined,
      createdAT: new Date(),
      reminderSent: false,
      review: '',
      rating: 0
    });
  
    // Emit WebSocket event for accepting initial bid
    this.eventsGateway.emitToconversation(
      bid.order.orderID,
      'acceptInitialBid',
      {
        orderId: bid.order.orderID,
        bidstatus: true,
        acceptedAmount: bid.initialBid_value,
        riderDetails: {
          riderId: rider.riderID,
          name: rider.name,
        },
        timestamp: new Date().getTime(),
      },
    );
  
    // Create notifications
    await this.notificationsService.create({
      message: `${rider.name} has accepted a bid placed by ${bid.order.customer.name}.`,
      subject: 'Bid Accepted',
      account: rider.riderID,
    });
  
    await this.notificationsService.create({
      message: `${rider.name} has accepted your bid for order ${bid.order.orderID}.`,
      subject: 'Bid Accepted',
      account: bid.order.customer.customerID,
    });
  
    // Push notification
    this.pushNotificationService.sendPushNotification(
      bid.order.customer.deviceToken,
      'Bid Accepted',
      'Opening bid accepted'
    );
  
    return {
      success: true,
      message: 'Bid accepted successfully, please proceed to making payment',
    };
  }

  private async hideOtherRiderBids(bidID: string, acceptingRiderID: string): Promise<void> {
    // Get all responses for this bid from riders other than the accepting rider
    const otherResponses = await this.riderBidResponseRepository.find(bidID);
    
    // Filter to get only responses from other riders
    const otherRiderResponses = otherResponses.filter(
      response => response.rider.riderID !== acceptingRiderID
    );
    
    // Update each other rider's response to set isVisible = false
    for (const response of otherRiderResponses) {
      await this.riderBidResponseRepository.update(response.id, {
        isVisible: false
      });
      
     
    }
  }



private async processDeclineBid(
  bid: BidEntity,
  rider: RiderEntity,
  existingResponse: RiderBidResponse | undefined,
  responseID: string,
): Promise<BidActionResult> {
  // Update rider's response to DECLINED
  if (existingResponse) {
    await this.riderBidResponseRepository.update(existingResponse.id, {
      status: RiderBidResponseStatus.DECLINED,
      respondedAt: new Date(),
      isVisible: false, // Hide this bid from this rider
    });
  } else {
    await this.riderBidResponseRepository.create({
      responseID: responseID,
      rider: rider,
      bid: bid,
      status: RiderBidResponseStatus.DECLINED,
      respondedAt: new Date(),
      isVisible: false,
      id: 0
    });
   
  }

  

  // Create notifications
  await this.notificationsService.create({
    message: `You have declined a bid for order ${bid.order.orderID}.`,
    subject: 'Bid Declined',
    account: rider.riderID,
  });

  // No need to notify customer when a rider declines
  // Only notify when all riders have declined

  // Check if all riders have declined this bid
  const allResponses = await this.riderBidResponseRepository.find(bid.bidID);
  
  const allDeclined = allResponses.every(
    response => response.status === RiderBidResponseStatus.DECLINED
  );

  if (allDeclined) {
    // If all riders have declined, notify the customer
    await this.notificationsService.create({
      message: `All riders have declined your bid for order ${bid.order.orderID}.`,
      subject: 'All Bids Declined',
      account: bid.order.customer.customerID,
    });
    
    // Push notification
    this.pushNotificationService.sendPushNotification(
      bid.order.customer.deviceToken,
      'All Bids Declined',
      'No riders available for your order'
    );
  }

  return {
    success: true,
    message: 'Bid declined successfully',
  };
}



  async CounterBid(
    rider: RiderEntity,
    bidID: string,
    dto: CounterBidDto,
  ): Promise<StandardResponse<Bid>> {
    try {
      const bid = await this.bidRepository.findByID(bidID);
      if (!bid) return this.responseService.notFound('bid not found ');

      if (bid.bidStatus === BidStatus.BID_ACCEPTED)
        return this.responseService.badRequest(
          'this bid has already been accepted , so you cannot counter',
        );

      //we can have multiple counters from different riders so we wont set an is countered restrain
      const updatedBid = {
        ...bid,
        counteredBid_value: dto.counterOffer,
        counteredAT: new Date(),
        bidStatus: BidStatus.COUNTERED,
        rider: rider,
      };

      const savedBid = await this.bidRepository.update(bid.id, updatedBid);

      // Start WebSocket conversation if not already started
      this.eventsGateway.startconversation(
        bid.order.orderID,
        rider.riderID,
        bid.order.customer.customerID,
      );

      // Emit WebSocket event for counter bid
      this.eventsGateway.emitToconversation(bid.order.orderID, 'counterBid', {
        orderId: bid.order.orderID,
        bidAmount: dto.counterOffer,
        riderDetails: {
          riderId: rider.riderID,
          name: rider.name,
        },
        previousAmount: bid.initialBid_value,
        timestamp: new Date().getTime(),
        message: 'Counter offer submitted',
      });

      // Create notification for the customer
      await this.notificationsService.create({
        message: `${rider.name} has countered your bid with an offer of ${dto.counterOffer}`,
        subject: 'Bid Countered',
        account: bid.order.customer.customerID,
      });

      // Create notification for the rider
      await this.notificationsService.create({
        message: `You have countered the bid for order #${bid.order.orderID} with ${dto.counterOffer}`,
        subject: 'Bid Countered',
        account: bid.rider.riderID,
      });

     // push notification
       this.pushNotificationService.sendPushNotification(
        bid.order.customer.deviceToken,
        'Bid Countered',
        'openning bid countered'
      )

      return this.responseService.success(
        'Bid countered successfully',
        savedBid,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error while countering bid',
        error.message,
      );
    }
  }

  async cancelRide(
    rider: RiderEntity,
    rideId: string,
    dto: CancelRideDto,
  ): Promise<StandardResponse<any>> {
    try {
      const ride = await this.ridesRepo.findByIDRelatedtoRider(
        rideId,
        rider.riderID,
      );
      if (!ride) return this.responseService.notFound('Ride not found');

      if (ride.order.paymentStatus === PaymentStatus.SUCCESFUL)
        return this.responseService.badRequest(
          'ride has been paid for already, so the ride cannot be cancelled, please escalate this issue with the customer support at Truckways. Thank you',
        );

      if (ride.status === RideStatus.ONGOING)
        return this.responseService.badRequest(
          'Ride already ongoing, sorry you cannot cancel this ride now. Thank you',
        );

      //cancel the ride
      ride.cancelledAt = new Date();
      ride.reason_for_cancelling_ride = dto.reason;
      ride.order = null;
      ride.rider = null;
      ride.isCancelled = true;
      ride.status = RideStatus.CANCELLED;

      await this.ridesRepo.save(ride);

      //push notification
       this.pushNotificationService.sendPushNotification(
        ride.order.customer.deviceToken,
        'Ride Cancelled',
        'ride cancelled by rider'
      )

      // Create notification for the rider
      await this.notificationsService.create({
        message: `Ride with id ${ride.ridesID} have been cancelled by this rider for this reason: ${dto.reason}`,
        subject: 'Ride Cancelled',
        account: rider.riderID,
      });

      await this.responseService.success(
        `Ride with id ${ride.ridesID} have been cancelled by this rider for this reason: ${dto.reason}`,
        ride,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error while cancelling ride',
      );
    }
  }

  async GetAvailableBidsForRider(
    rider:RiderEntity,
  ): Promise<StandardResponse<Bid[]>> {
    try {
      // Get all rider's bid responses
      const riderResponses = await this.riderBidResponseRepository.findAllVisibleBids(rider.riderID)
      // Filter to get only bids with BID_SENT status
      const availableBids = riderResponses
        .filter(response => response.bid.bidStatus === BidStatus.BID_SENT)
        .map(response => response.bid);
  
      return this.responseService.success(availableBids.length > 0 ?
        'Available bids retrieved successfully':'no available bids found at the moment for this rider',
        availableBids
      );
    } catch (error) {
      console.error('GetAvailableBidsForRider error:', error);
      return this.responseService.internalServerError(
        'Error retrieving available bids',
        error.message
      );
    }
  }

  async FetchAllMyOrders(
    dto: PaginationDto,
    rider: RiderEntity,
  ): Promise<StandardResponse<{ data: Order[]; total: number }>> {
    try {
      const { data: orders, total } =
        await this.orderRepository.findAllRelatedToRider(rider.riderID, dto);

      return this.responseService.success(
        orders.length ? 'Orders retrived successfully' : 'No orders yet',
        {
          data: orders,
          total,
          currentPage: dto.page,
          pageSize: dto.limit,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error fetching orders',
        error.message,
      );
    }
  }

  async FetchOneOrder(orderID: string): Promise<StandardResponse<Order>> {
    try {
      const order = await this.orderRepository.findByID(orderID);
      if (!order) return this.responseService.notFound('Order not found');

      return this.responseService.success(
        'single order retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one order',
        error.message,
      );
    }
  }

  //rides
  async enrouteToPickupLocation(
    rider: RiderEntity,
    ridesID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('ride not found');

      // if (rides.order.paymentStatus !== PaymentStatus.SUCCESFUL) {
      //   return this.responseService.badRequest(
      //     'Payment has not been confirmed yet, so you cannot start this ride',
      //   );
      // }

      rides.milestone = RiderMileStones.ENROUTE_TO_PICKUP_LOCATION;
      rides.enroute_to_pickup_locationAT = new Date();
      rides.status = RideStatus.ONGOING;
      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        enroute_to_pickup_location: true,
      };
      await this.ridesRepo.save(rides);

      const savedRide = await this.ridesRepo.findByID(rides.ridesID);

      //update order
      rides.order.orderStatus = OrderStatus.ONGOING;
      await this.orderRepository.save(rides.order);

      await this.notificationsService.create({
        message: `${rides.milestone} milestone reached for this order ${rides.order.orderID}`,
        subject: 'MileStone Reached',
        account: rider.riderID,
      });

      return this.responseService.success(
        'milestone reached and checkpoint status updated successfully',
        savedRide,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error updating milestone',
      );
    }
  }

  async AtPickupLocation(
    rider: RiderEntity,
    ridesID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('ride not found');

      rides.milestone = RiderMileStones.AT_PICKUP_LOCATION;
      rides.at_pickup_locationAT = new Date();
      rides.status = RideStatus.ONGOING;
      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        at_pickup_location: true,
      };
      await this.ridesRepo.save(rides);

      const savedRide = await this.ridesRepo.findByID(rides.ridesID);

      //update order
      rides.order.orderStatus = OrderStatus.ONGOING;
      await this.orderRepository.save(rides.order);

      await this.notificationsService.create({
        message: `${rides.milestone} milestone reached for this order ${rides.order.orderID}`,
        subject: 'MileStone Reached',
        account: rider.riderID,
      });

      return this.responseService.success(
        'milestone reached and checkpoint status updated successfully',
        savedRide,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error updating milestone',
      );
    }
  }

  async PickedUpParcel(
    rider: RiderEntity,
    ridesID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('ride not found');

      rides.milestone = RiderMileStones.PICKED_UP_PARCEL;
      rides.picked_up_parcelAT = new Date();
      rides.status = RideStatus.ONGOING;
      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        picked_up_parcel: true,
      };
      await this.ridesRepo.save(rides);

      const savedRide = await this.ridesRepo.findByID(rides.ridesID);

      //update order
      rides.order.orderStatus = OrderStatus.ONGOING;
      await this.orderRepository.save(rides.order);

      await this.notificationsService.create({
        message: `${rides.milestone} milestone reached for this order ${rides.order.orderID}`,
        subject: 'MileStone Reached',
        account: rider.riderID,
      });

      return this.responseService.success(
        'milestone reached and checkpoint status updated successfully',
        savedRide,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error updating milestone',
      );
    }
  }

  async enrouteToDropOffLocation(
    rider: RiderEntity,
    ridesID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('ride not found');

      rides.milestone = RiderMileStones.ENROUTE_TO_DROPOFF_LOCATION;
      rides.enroute_to_dropoff_locationAT = new Date();
      rides.status = RideStatus.ONGOING;
      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        enroute_to_dropoff_location: true,
      };
      await this.ridesRepo.save(rides);

      const savedRide = await this.ridesRepo.findByID(rides.ridesID);

      //update order
      rides.order.orderStatus = OrderStatus.ONGOING;
      await this.orderRepository.save(rides.order);

      await this.notificationsService.create({
        message: `${rides.milestone} milestone reached for this order ${rides.order.orderID}`,
        subject: 'MileStone Reached',
        account: rider.riderID,
      });

      return this.responseService.success(
        'milestone reached and checkpoint status updated successfully',
        savedRide,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error updating milestone',
      );
    }
  }

  async AtDropOffLocation(
    rider: RiderEntity,
    ridesID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('ride not found');

      rides.milestone = RiderMileStones.AT_DROPOFF_LOCATION;
      rides.at_dropoff_locationAT = new Date();
      rides.status = RideStatus.ONGOING;
      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        at_dropoff_location: true,
      };
      await this.ridesRepo.save(rides);

      const savedRide = await this.ridesRepo.findByID(rides.ridesID);

      //update order
      rides.order.orderStatus = OrderStatus.ONGOING;
      await this.orderRepository.save(rides.order);

      await this.notificationsService.create({
        message: `${rides.milestone} milestone reached for this order ${rides.order.orderID}`,
        subject: 'MileStone Reached',
        account: rider.riderID,
      });

      return this.responseService.success(
        'milestone reached and checkpoint status updated successfully',
        savedRide,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error updating milestone',
      );
    }
  }

  async dropOffParcel(
    rider: RiderEntity,
    ridesID: string,
    dto: DropOffCodeDto,
  ): Promise<StandardResponse<Rides>> {
    try {
      // Fetch and validate ride
      const rides = await this.ridesRepo.findByID(ridesID);
      if (!rides) return this.responseService.notFound('Ride not found');
      if (!rides.order)
        return this.responseService.notFound('Associated order not found');

      const order = rides.order;

      // Validate drop-off code
      if (dto.dropOff_code !== order.dropoffCode)
        return this.responseService.badRequest('Drop-off code mismatch');

      // Handle items
      const invalidItems: string[] = [];
      for (const itemsID of dto.itemsDroppedOff) {
        const item = order.items.find((i) => i.orderItemID === itemsID);
        if (!item) invalidItems.push(itemsID);
        else if (item.isDroppedOff) {
          return this.responseService.badRequest(
            `Item ${itemsID} already dropped off`,
          );
        } else {
          item.isDroppedOff = true;
          item.droppedOffAT = new Date();
          await this.orderItemRepo.save(item);
        }
      }

      if (invalidItems.length) {
        return this.responseService.notFound(
          `Invalid items: ${invalidItems.join(', ')}`,
        );
      }

      // Update ride and order statuses
      rides.milestone = RiderMileStones.DROPPED_OFF_PARCEL;
      rides.dropped_off_parcelAT = new Date();

      const remainingItems = order.items.filter(
        (item) => !item.isDroppedOff,
      ).length;
      if (remainingItems === 0) {
        rides.status = RideStatus.CONCLUDED;
        order.orderStatus = OrderStatus.COMPLETED;
        rider.RiderStatus = RiderStatus.AVAILABLE;
        await this.riderRepository.save(rider);
      } else {
        rides.status = RideStatus.ONGOING;
        order.orderStatus = OrderStatus.ONGOING;
      }

      rides.checkpointStatus = {
        ...rides.checkpointStatus,
        'dropped_off-parcel': true,
      };

      await this.ridesRepo.save(rides);
      await this.orderRepository.save(order);

      // Trigger final wallet funding after ride completion
      try {
        await this.walletService.FinalFundWallet(rider.riderID, order.orderID);
      } catch (error) {
        console.error('Error processing final payment:', error);
      }

      // Notification
      try {
        await this.notificationsService.create({
          message: `${rides.milestone} milestone reached for order ${rides.order.orderID}`,
          subject: 'Milestone Reached',
          account: rider.riderID,
        });
      } catch (notifError) {
        console.error('Notification Error:', notifError.message);
      }

      return this.responseService.success(
        'Milestone reached and checkpoint status updated successfully',
        rides,
      );
    } catch (error) {
      console.error('Drop-off Error:', error.message);
      return this.responseService.internalServerError(
        'Error dropping off a parcel',
        error.message,
      );
    }
  }

  async FetchAllrides(
    rider: RiderEntity,
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Rides[]; total: number }>> {
    try {
      const { data: rides, total } =
        await this.ridesRepo.findAllRelatedToARider(dto, rider.riderID);

      return this.responseService.success(
        rides.length ? 'Rides retrived successfully' : 'No rides yet',
        {
          data: rides,
          total,
          currentPage: dto.page,
          pageSize: dto.limit,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error fetching rides',
        error.message,
      );
    }
  }

  async FetchOneRide(
    rider: RiderEntity,
    rideID: string,
  ): Promise<StandardResponse<Rides>> {
    try {
      const order = await this.ridesRepo.findByIDRelatedtoRider(
        rideID,
        rider.riderID,
      );
      if (!order) return this.responseService.notFound('ride not found');

      return this.responseService.success(
        'single ride retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one ride',
        error.message,
      );
    }
  }



  async FetchAllMyTransactions(
    dto: PaginationDto,
    rider: RiderEntity,
  ): Promise<StandardResponse<{ data: Transactions[]; total: number }>> {
    try {
      const { data: transactions, total } =
        await this.transactionRepository.findRelatedToRider(
          rider.riderID,
          dto,
        );

      return this.responseService.success(
        transactions.length ? 'transactions retrived successfully' : 'No transactions  yet',
        {
          data: transactions,
          total,
          currentPage: dto.page,
          pageSize: dto.limit,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error fetching transactions',
        error.message,
      );
    }
  }

  async FetchOneTransaction(transactionID: string): Promise<StandardResponse<Transactions>> {
    try {
      const order = await this.transactionRepository.findByID(transactionID);
      if (!order) return this.responseService.notFound('Transaction not found');

      return this.responseService.success(
        'single transaction retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one transaction',
        error.message,
      );
    }
  }
}
