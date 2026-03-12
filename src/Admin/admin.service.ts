import {
  ResponseService,
  StandardResponse,
} from 'src/utils/services/response.service';
import {
  AdminRepository,
  AnnounceRepository,
  PercentageConfigRepository,
} from './Infrastructure/Persistence/admin-repository';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { AdminEntity } from './Infrastructure/Persistence/Relational/Entity/admin.entity';
import { NotificationListResponse } from 'src/utils/Types/notification.responsetypes';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { markMultipleNotificationsAsReadDto } from 'src/utils/shared-dto/notification.dto';
import { Admin } from './Domain/admin';
import { updateAdminDto } from './Dto/update-admin.dto';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import {
  BidRepository,
  OrderCartRepository,
  OrderRepository,
} from 'src/Order/Infrastructure/Persistence/all-order-repositories';
import { OrderCart } from 'src/Order/Domain/order-cart';
import { PaginationDto, SearchDto } from 'src/utils/shared-dto/pagination.dto';
import { Bid } from 'src/Order/Domain/bids';
import { BidActionDto } from '../utils/shared-dto/bid-action.dto';
import {
  BidAction,
  BidActionResult,
  BidStatus,
  BidTypeAccepted,
} from 'src/Enums/order.enum';
import { BidEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/bids.entity';
import { Order } from 'src/Order/Domain/order';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { Customer } from 'src/Customer/Domain/customer';
import { CustomerRepository } from 'src/Customer/Infrastructure/Persistence/customer-repository';
import {
  RiderRepository,
  RidesRepository,
  TransactionRepository,
  VehicleRepository,
  WalletRepository,
} from 'src/Rider/Infrastructure/Persistence/rider-repository';
import { Rider } from 'src/Rider/Domain/rider';
import { Transactions } from 'src/Rider/Domain/transaction';
import { AppproveRiderDto, BlockRiderDto } from './Dto/approve-rider.dto';
import { GeneratorService } from 'src/utils/services/generator.service';
import {
  CreatePercentageDto,
  UpdatePercentageDto,
} from './Dto/percentage-config.dto';
import { PercentageConfig } from './Domain/percentage';
import { Rides } from 'src/Rider/Domain/rides';
import { MakeAnnouncementDto } from './Dto/announcement.dto';
import { Announcement } from './Domain/announcement';
import {
  AnnonuncmentTargetUser,
  AnnouncementMeduim,
} from 'src/Enums/announcement.enum';
import { MailService } from 'src/mailer/mailer.service';
import { title } from 'process';

import { PushNotificationsService } from 'src/utils/services/push-notification.service';
@Injectable()
export class AdminService {
  constructor(
    private adminRepo: AdminRepository,
    private BidRepository: BidRepository,
    private responseService: ResponseService,
    private cloudinaryService: CloudinaryService,
    private notificationsService: NotificationsService,
    private geolocationService: GeoLocationService,
    private customerRepo: CustomerRepository,
    private riderRepo: RiderRepository,
    private vehicleRepo: VehicleRepository,
    private transactionRepo: TransactionRepository,
    private orderRepository: OrderRepository,
    private bidRepository: BidRepository,
    private walletRipo: WalletRepository,
    private percentageRepo: PercentageConfigRepository,
    private ridesRepository: RidesRepository,
    private announcemementRepository: AnnounceRepository,
    private genefratorService: GeneratorService,
    private mailService: MailService,
    private readonly eventsGateway: EventsGateway,
    private readonly pushNotificationService: PushNotificationsService,
  ) {}

  async fetchAllNotifications(
    admin: AdminEntity,
    query?: { page?: number; limit?: number },
  ): Promise<StandardResponse<NotificationListResponse>> {
    try {
      if (!admin?.adminID) {
        return this.responseService.badRequest('Invalid admin ID provided');
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 10;

      const { notifications, count, unreadCount } =
        await this.notificationsService.fetchAllAdmin({
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
          : 'No notifications found for this customer',
        response,
      );
    } catch (error) {
      const errorMessage = error?.message || 'Unknown error occurred';

      // Log the error for debugging
      console.error('Notification fetch error:', {
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
    admin: AdminEntity,
    notificationId: string,
  ): Promise<StandardResponse<NotificationsEntity>> {
    try {
      if (!admin?.adminID) {
        return this.responseService.badRequest('Invalid admin ID provided');
      }

      const updatedNotification =
        await this.notificationsService.markAsReadAdmin(notificationId);

      return this.responseService.success(
        'Notification marked as read successfully',
        updatedNotification,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.responseService.notFound(error.message);
      }

      console.error('Error marking notification as read:', {
        admin: admin.adminID,
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
    admin: AdminEntity,
    dto: markMultipleNotificationsAsReadDto,
  ): Promise<StandardResponse<void>> {
    try {
      if (!admin?.adminID) {
        return this.responseService.badRequest('Invalid admin ID provided');
      }

      if (
        !Array.isArray(dto.notificationIds) ||
        dto.notificationIds.length === 0
      ) {
        return this.responseService.badRequest(
          'Please provide valid notification IDs',
        );
      }

      await this.notificationsService.markMultipleAsReadAdmin(
        dto.notificationIds,
      );

      return this.responseService.success(
        'Notifications marked as read successfully',
      );
    } catch (error) {
      console.error('Error marking multiple notifications as read:', {
        admin: admin.adminID,
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
    admin: AdminEntity,
  ): Promise<StandardResponse<void>> {
    try {
      if (!admin?.adminID) {
        return this.responseService.badRequest('Invalid customerID provided');
      }

      await this.notificationsService.markAllAsRead(admin.adminID);

      return this.responseService.success(
        'All notifications marked as read successfully',
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        customer: admin.adminID,
        error: error.message,
        stack: error.stack,
      });

      return this.responseService.internalServerError(
        'Error marking all notifications as read',
        error.message,
      );
    }
  }

  async UpdateAdmin(
    admin: AdminEntity,
    dto: updateAdminDto,
  ): Promise<StandardResponse<Admin>> {
    try {
      // Create a copy of the customer without the address first
      const { address: _, ...adminWithoutAddress } = admin;

      // Create base update object
      const updateObject: any = {
        ...adminWithoutAddress,
        ...dto,
        updatedAT: new Date(),
      };

      // Handle email check
      if (dto.email) {
        const checkemail = await this.adminRepo.findByEmail(dto.email);
        if (checkemail && checkemail.id !== admin.id) {
          return this.responseService.badRequest('email already exists');
        }
      }

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
      } else if (admin.address) {
        // Keep existing address if no new address provided
        updateObject.address = admin.address;
      }

      // Perform the update
      await this.adminRepo.save(updateObject);

      // Fetch the updated customer to return the latest data
      const updatedAdmin = await this.adminRepo.findByID(admin.id);

      // Save notification
      await this.notificationsService.create({
        message: `${updatedAdmin.name} has updated their record.`,
        subject: 'Account Updated',
        account: updatedAdmin.adminID,
      });

      return this.responseService.success(
        'admin record updated successfully',
        updatedAdmin,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error updating user record',
        error.message,
      );
    }
  }

  async uploadUserProfilePics(
    admin: AdminEntity,
    mediafile: Express.Multer.File,
  ): Promise<StandardResponse<Admin>> {
    try {
      const display_pics = await this.cloudinaryService.uploadFile(mediafile);
      const mediaurl = display_pics.secure_url;

      admin.profilePicture = mediaurl;

      await this.adminRepo.save(admin);

      await this.notificationsService.create({
        message: ` ${admin.name},  has uploaded profile pics .`,
        subject: 'Account Updated',
        account: admin.adminID, //saves when the user is created
      });

      return this.responseService.success('profile pics updated', admin);
    } catch (error) {
      return this.responseService.internalServerError(
        'Error uploading profile pics',
        error.message,
      );
    }
  }

  //fetches

  // fetch all bids
  async Fetchallbids(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Bid[]; total: number }>> {
    try {
      const { data: bids, total } = await this.BidRepository.fetchALL(dto);

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
      const bid = await this.BidRepository.findByID(bidId);
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

  async FetchAllOrders(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Order[]; total: number }>> {
    try {
      const { data: orders, total } = await this.orderRepository.findAll(dto);

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

  async FetchAllAdmins(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Admin[]; total: number }>> {
    try {
      const { data: orders, total } = await this.adminRepo.find(dto);

      return this.responseService.success(
        orders.length ? 'Admins retrived successfully' : 'No admins yet',
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
        'Error fetching admins',
        error.message,
      );
    }
  }

  async FetchOneAdmin(id: number): Promise<StandardResponse<Admin>> {
    try {
      const order = await this.adminRepo.findByID(id);
      if (!order) return this.responseService.notFound('admin not found');

      return this.responseService.success(
        'single admin retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one admin',
        error.message,
      );
    }
  }

  async FetchAllCustomers(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Customer[]; total: number }>> {
    try {
      const { data: orders, total } = await this.customerRepo.find(dto);

      return this.responseService.success(
        orders.length ? 'Customers retrived successfully' : 'No customers yet',
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
        'Error fetching customers',
        error.message,
      );
    }
  }

  async FetchOneCustomer(id: number): Promise<StandardResponse<Customer>> {
    try {
      const order = await this.customerRepo.findByID(id);
      if (!order) return this.responseService.notFound('Customer not found');

      return this.responseService.success(
        'single customer retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one customer',
        error.message,
      );
    }
  }

  async FetchAllRiders(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Rider[]; total: number }>> {
    try {
      const { data: orders, total } = await this.riderRepo.find(dto);

      return this.responseService.success(
        orders.length ? 'Riders retrived successfully' : 'No riders yet',
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
        'Error fetching riders',
        error.message,
      );
    }
  }

  async FetchOneRider(id: number): Promise<StandardResponse<Rider>> {
    try {
      const order = await this.riderRepo.findByID(id);
      if (!order) return this.responseService.notFound('Rider not found');

      return this.responseService.success(
        'single rider retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one order',
        error.message,
      );
    }
  }

  async FetchAllTransactions(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Transactions[]; total: number }>> {
    try {
      const { data: orders, total } = await this.transactionRepo.find(dto);

      return this.responseService.success(
        orders.length
          ? 'Transactions retrived successfully'
          : 'No transactions yet',
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
        'Error fetching transactions',
        error.message,
      );
    }
  }

  async FetchOneTransaction(
    orderID: string,
  ): Promise<StandardResponse<Transactions>> {
    try {
      const order = await this.transactionRepo.findByID(orderID);
      if (!order) return this.responseService.notFound('transaction not found');

      return this.responseService.success(
        'single transaction retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one order',
        error.message,
      );
    }
  }

  async FetchAllrides(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Rides[]; total: number }>> {
    try {
      const { data: rides, total } = await this.ridesRepository.find(dto);

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

  async FetchOneRide(orderID: string): Promise<StandardResponse<Rides>> {
    try {
      const order = await this.ridesRepository.findByID(orderID);
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

  ////searches

  async searchAdmin(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Admin[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.adminRepo.searchAdmin(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchCustomer(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Customer[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.customerRepo.searchCustomer(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchRider(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Rider[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.riderRepo.searchRider(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchOrder(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Order[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.orderRepository.searchOrder(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchTrasaction(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Transactions[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.transactionRepo.searchTransactions(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchBid(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Bid[]; total: number }>> {
    try {
      const { data: tickets, total } =
        await this.bidRepository.searchBid(searchDto);

      if (!tickets.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: tickets,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ticket',
      );
    }
  }

  async searchRides(
    searchDto: SearchDto,
  ): Promise<StandardResponse<{ data: Rides[]; total: number }>> {
    try {
      const { data: rides, total } =
        await this.ridesRepository.searchRides(searchDto);

      if (!rides.length)
        return this.responseService.notFound(
          `no search result found for the keyword: ${searchDto.keyword}`,
        );

      return this.responseService.success('search result found', {
        data: rides,
        total,
        currentPage: searchDto.page,
        pageSize: searchDto.Perpage,
      });
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error searching for a ride',
      );
    }
  }

  async ApproveRider(
    admin: AdminEntity,
    riderID: number,
    dto: AppproveRiderDto,
  ): Promise<StandardResponse<any>> {
    try {
      const rider = await this.riderRepo.findByID(riderID);
      if (!rider) return this.responseService.notFound('rider not found');

      if (dto && dto.approve === true) {
        rider.isAprroved = true;
      }
      const updatedRider = await this.riderRepo.save(rider);

      //send mail to rider

      //create wallet for rider
      const walletAddress =
        await this.genefratorService.generateWalletAddress();
      const wallet = await this.walletRipo.create({
        id: 0,
        walletAddrress: walletAddress,
        createdAt: new Date(),
        rider: updatedRider,
        balance: 0,
        updatedAT: undefined,
      });

      // Save notification
      await this.notificationsService.create({
        message: `${rider.name} has been approved  by ${admin.name}.`,
        subject: 'Rider Approved',
        account: updatedRider.riderID,
      });

      return this.responseService.success(
        'rider account approved and wallet created successfully',
        {
          ApprovedRider: updatedRider,
          wallet: wallet,
        },
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error approving a rider for truckways',
        error.message,
      );
    }
  }

  async blockRider(
    admin: AdminEntity,
    riderID: number,
    dto: BlockRiderDto,
  ): Promise<StandardResponse<Rider>> {
    try {
      const rider = await this.riderRepo.findByID(riderID);
      if (!rider) return this.responseService.notFound('rider not found');

      // Update the blocked status based on dto.block value
      rider.isBlocked = dto.block;
      const updatedRider = await this.riderRepo.save(rider);

      // Prepare notification message based on block status
      const action = dto.block ? 'blocked' : 'unblocked';
      await this.notificationsService.create({
        message: `${rider.name} has been ${action} by ${admin.name}.`,
        subject: `Rider ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        account: updatedRider.riderID,
      });

      return this.responseService.success(
        `rider account ${action} successfully`,
        updatedRider,
      );
    } catch (error) {
      console.error(error);
      const action = dto.block ? 'blocking' : 'unblocking';
      return this.responseService.internalServerError(
        `Error ${action} a rider for truckways`,
        error.message,
      );
    }
  }

  async createPercentage(
    admin: AdminEntity,
    dto: CreatePercentageDto,
  ): Promise<StandardResponse<PercentageConfig>> {
    try {
      const config = await this.percentageRepo.findByType(dto.type);
      if (config)
        return this.responseService.badRequest(`${dto.type} already exists`);

      //create new config
      const newConfig = await this.percentageRepo.create({
        id: 0,
        type: dto.type,
        percentage: dto.percentage,
        createdAT: new Date(),
        updatedAT: undefined,
        isActive: true,
      });

      // Save notification
      await this.notificationsService.create({
        message: `${admin.name} has configured ${dto.type} to ${dto.percentage}%.`,
        subject: 'Percentage configuration',
        account: admin.adminID,
      });

      return this.responseService.success(
        'percentage configured successfully',
        newConfig,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error configuring percentages',
        error.message,
      );
    }
  }

  async updatePercentage(
    admin: AdminEntity,
    dto: UpdatePercentageDto,
    percentageId: number,
  ): Promise<StandardResponse<PercentageConfig>> {
    try {
      const config = await this.percentageRepo.findByID(percentageId);
      if (!config) return this.responseService.notFound('percentage not found');

      // Update and get the updated configuration
      const updatedConfig = await this.percentageRepo.save({
        ...config,
        percentage: dto.percentage,
        updatedAT: new Date(),
      });

      // Save notification
      await this.notificationsService.create({
        message: `${admin.name} has re-configured ${config.type} with a new percent ${dto.percentage}%.`,
        subject: 'Percentage configuration',
        account: admin.adminID,
      });

      return this.responseService.success(
        'percentage re-configured successfully',
        updatedConfig, // Return the updated configuration
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error re-configuring percentages',
        error.message,
      );
    }
  }

  async FetchAllPercentage(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: PercentageConfig[]; total: number }>> {
    try {
      const { data: orders, total } = await this.percentageRepo.find(dto);

      return this.responseService.success(
        orders.length
          ? 'Percentage configurations retrived successfully'
          : 'No percentage configurations  yet',
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
        'Error fetching percentage configurations',
        error.message,
      );
    }
  }

  async FetchOnePercentageConfiguration(
    percentID: number,
  ): Promise<StandardResponse<PercentageConfig>> {
    try {
      const order = await this.percentageRepo.findByID(percentID);
      if (!order)
        return this.responseService.notFound(
          'percentage configuration not found not found',
        );

      return this.responseService.success(
        'single percentage configuration  retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one percentage configuration ',
        error.message,
      );
    }
  }

  async makeAnnouncement(
    admin: AdminEntity,
    dto: MakeAnnouncementDto,
  ): Promise<StandardResponse<Announcement>> {
    try {
      let usertype = dto.targetUser;
      let result: { successful: number; failed: number } = {
        successful: 0,
        failed: 0,
      };

      if (dto.announcementMedium === AnnouncementMeduim.EMAIL) {
        if (usertype === AnnonuncmentTargetUser.CUSTOMERS) {
          const customers =
            await this.customerRepo.findCustomersForAnnouncement();
          const emails = customers
            .map((customer) => customer.email)
            .filter(Boolean);

          if (emails.length === 0)
            return this.responseService.badRequest(
              'No comfirmed customer emails found',
              null,
            );
          result = await this.mailService.sendAnnouncementEmail(
            emails,
            dto.title,
            dto.body,
          );
        } else if (usertype === AnnonuncmentTargetUser.RIDERS) {
          const riders = await this.riderRepo.findRidersForAnnouncement();
          const emails = riders.map((rider) => rider.email).filter(Boolean);

          if (emails.length === 0)
            return this.responseService.badRequest(
              'No approved rider emails found',
              null,
            );
          result = await this.mailService.sendAnnouncementEmail(
            emails,
            dto.title,
            dto.body,
          );
        }
        //handle it here
      } else if (
        dto.announcementMedium === AnnouncementMeduim.PUSH_NOTIFICATION
      ) {
        if (usertype === AnnonuncmentTargetUser.CUSTOMERS) {
          const customers =
            await this.customerRepo.findCustomersForAnnouncement();
          const tokens = customers
            .map((customer) => customer.deviceToken)
            .filter(Boolean);

          if (tokens.length === 0)
            return this.responseService.badRequest(
              'no customer deviceToken found',
            );

          //prepare data for the notification
          const data = {
            type: 'announcement',
            targetUser: AnnonuncmentTargetUser.CUSTOMERS,
            timestamp: new Date().toISOString(),
          };

          //create and send message using multicats
          const message = {
            notification: {
              title: dto.title,
              body: dto.body,
            },
            data,
            tokens,
          };

          result =
            await this.pushNotificationService.sendNotificationToTargetUsers(
              tokens,
              dto.title,
              dto.body,
              data,
            );
        } else if (usertype === AnnonuncmentTargetUser.RIDERS) {
          const riders = await this.riderRepo.findRidersForAnnouncement();
          const tokens = riders
            .map((rider) => rider.deviceToken)
            .filter(Boolean);

          if (tokens.length === 0)
            return this.responseService.badRequest(
              'no riders deviceToken found',
            );

          //prepare data for the notification
          const data = {
            type: 'announcement',
            targetUser: AnnonuncmentTargetUser.RIDERS,
            timestamp: new Date().toISOString(),
          };

          //create and send message using multicats
          const message = {
            notification: {
              title: dto.title,
              body: dto.body,
            },
            data,
            tokens,
          };

          result =
            await this.pushNotificationService.sendNotificationToTargetUsers(
              tokens,
              dto.title,
              dto.body,
              data,
            );
        }
      }

      //create new config
      const newAnnouncement = await this.announcemementRepository.create({
        id: 0,
        announcementMedium: dto.announcementMedium,
        targetUser: dto.targetUser,
        createdAT: new Date(),
        updatedAT: undefined,
        title: dto.title,
        body: dto.body,
      });

      // Save notification
      await this.notificationsService.create({
        message: `${admin.name} has made an announcement to all ${dto.targetUser} via ${dto.announcementMedium}.`,
        subject: 'Announcememnt From Truckways',
        account: admin.adminID,
      });

      return this.responseService.success(
        `${admin.name} has made an announcement to all ${dto.targetUser} via ${dto.announcementMedium} successfully. ${result.successful} sent, ${result.failed} failed.`,
        newAnnouncement,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error making announcement',
        error.message,
      );
    }
  }

  async FetchAllAnnouncements(
    dto: PaginationDto,
  ): Promise<StandardResponse<{ data: Announcement[]; total: number }>> {
    try {
      const { data: orders, total } =
        await this.announcemementRepository.find(dto);

      return this.responseService.success(
        orders.length
          ? 'Announcements retrived successfully'
          : 'No announcements  yet',
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
        'Error fetching announcements',
        error.message,
      );
    }
  }

  async FetchOneannouncement(
    announcementID: number,
  ): Promise<StandardResponse<Announcement>> {
    try {
      const order =
        await this.announcemementRepository.findByID(announcementID);
      if (!order)
        return this.responseService.notFound('announcement not found ');

      return this.responseService.success(
        'single announcement  retrieved successfully',
        order,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching one announcement ',
        error.message,
      );
    }
  }

  //counts

  async CustomerCount(): Promise<StandardResponse<number>> {
    try {
      const count = await this.customerRepo.customerCount();

      return this.responseService.success(
        'Customer count returned successfully',
        count,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching customer count ',
        error.message,
      );
    }
  }

  async RiderCount(): Promise<StandardResponse<number>> {
    try {
      const count = await this.riderRepo.RiderCount();

      return this.responseService.success(
        'Rider count returned successfully',
        count,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching rider count ',
        error.message,
      );
    }
  }

  async OrderCount(): Promise<StandardResponse<number>> {
    try {
      const count = await this.orderRepository.orderCount();

      return this.responseService.success(
        'Order count returned successfully',
        count,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching order count ',
        error.message,
      );
    }
  }

  async bidCount(): Promise<StandardResponse<number>> {
    try {
      const count = await this.bidRepository.bidCount();

      return this.responseService.success(
        'Bids count returned successfully',
        count,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching bid count ',
        error.message,
      );
    }
  }

  async AllTransactionMetrics(): Promise<
    StandardResponse<{
      totalPaymentsMade: number;
      totalRevenue: number;
      totalDisbursedMoney: number;
      totalUndisbursedMoney: number;
    }>
  > {
    try {
      const metrics = await this.transactionRepo.getTransactionMetrics();

      return this.responseService.success(
        'All transaction metrics returned successfully',
        {
          totalPaymentsMade: metrics.totalPaymentsMade,
          totalRevenue: metrics.totalRevenue,
          totalDisbursedMoney: metrics.totalDisbursedMoney,
          totalUndisbursedMoney: metrics.totalUndisbursedMoney,
        },
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error while returning transaction metrics',
        error.message,
      );
    }
  }
}
