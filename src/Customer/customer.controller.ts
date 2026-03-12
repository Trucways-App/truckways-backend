import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/Auth/Guard/jwt.guard';
import { CustomerService } from './customer.service';
import { StandardResponse } from 'src/utils/services/response.service';
import { NotificationListResponse } from 'src/utils/Types/notification.responsetypes';
import { PaginationParams } from 'src/utils/services/notifications.service';
import { NotificationsEntity } from 'src/utils/shared-entities/notification.entity';
import { markMultipleNotificationsAsReadDto } from 'src/utils/shared-dto/notification.dto';
import { Customer } from './Domain/customer';
import { FileInterceptor } from '@nestjs/platform-express';
import { updateCustomerDto } from './Dto/update-customer.dto';
import { OrderCart } from 'src/Order/Domain/order-cart';
import { Bid } from 'src/Order/Domain/bids';
import { PaginationDto } from 'src/utils/shared-dto/pagination.dto';
import { BidActionResult } from 'src/Enums/order.enum';
import { BidActionDto } from 'src/utils/shared-dto/bid-action.dto';
import { Order } from 'src/Order/Domain/order';
import { RoleGuard } from 'src/Auth/Guard/role.guard';
import { Roles } from 'src/Auth/Decorator/role.decorator';
import { Role } from 'src/Enums/users.enum';
import { CancelRideDto } from 'src/Rider/Dto/dropOff-code.dto';
import { Rides } from 'src/Rider/Domain/rides';
import { RatingReviewDto } from 'src/Order/Dto/ratingReview.dto';
import { Transactions } from 'src/Rider/Domain/transaction';

@ApiTags('Customer')
@ApiBearerAuth()
@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.CUSTOMER)
@Controller({
  path: 'customer/',
  version: '1',
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  //fetch all notifications

  @Get('all-customer-notifications')
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(StandardResponse<NotificationListResponse>),
        },
        {
          properties: {
            payload: {
              // $ref: getSchemaPath(),
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page',
  })
  @ApiOperation({ summary: 'all notifications for a Customer' })
  async fetchAllnotificationsRelatedToaPlanner(
    @Query() dto: PaginationParams,
    @Req() req,
  ): Promise<StandardResponse<NotificationListResponse>> {
    console.log(req.user);
    return await this.customerService.fetchAllNotifications(req.user, dto);
  }

  @Patch('/mark-as-read/:notificationId')
  @ApiParam({
    name: 'notificationId',
    required: true,
    description: 'The ID of the notification to mark as read',
    schema: { type: 'string' }, // Define the type of the param, here it's a number
  })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<NotificationsEntity>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(NotificationsEntity),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'mark a notification as read' })
  async markAsRead(
    @Req() req,
    @Param('notificationId') notificationId: string,
  ) {
    return this.customerService.markNotificationAsRead(
      req.user,
      notificationId,
    );
  }

  @Patch('mark-multiple-as-read')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notificationIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<NotificationsEntity>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(NotificationsEntity),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'mark some selected notifications as read' })
  async markMultipleAsRead(
    @Req() req,
    @Body() dto: markMultipleNotificationsAsReadDto,
  ) {
    return this.customerService.markMultipleNotificationsAsRead(req.user, dto);
  }

  @Patch('mark-all-as-read')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<void>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(NotificationsEntity),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'mark all notifications as read' })
  async markAllAsRead(@Req() req) {
    return this.customerService.markAllNotificationsAsRead(req.user);
  }

  @Patch('update-record')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Customer>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Customer),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'update customer records' })
  // @HttpCode(HttpStatus.OK)
  async UpdateRecord(
    @Body() dto: updateCustomerDto,
    @Req() req,
  ): Promise<StandardResponse<Customer>> {
    return await this.customerService.UpdateCustomer(req.user, dto);
  }

  //update including adding pics
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePics: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('upload-profilePics')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Customer>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Customer),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'upload user profile pics' })
  // @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePics'))
  async UploadProfilePics(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StandardResponse<Customer>> {
    return await this.customerService.uploadUserProfilePics(req.user, file);
  }

  @Get('my-cart')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<OrderCart>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(OrderCart),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch my cart' })
  async FetchMyCart(@Req() req): Promise<StandardResponse<OrderCart>> {
    return await this.customerService.fetchMyCart(req.user);
  }

  @Get('all-my-bids')
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(StandardResponse<{ data: Bid[]; total: number }>),
        },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Bid),
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    description: 'Sorting field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sorting order',
  })
  @ApiOperation({ summary: 'all bids related to an order and a customer' })
  async fetchAlBids(
    @Query() dto: PaginationDto,
    @Req() req,
  ): Promise<StandardResponse<{ data: Bid[]; total: number }>> {
    console.log(req.user);
    return await this.customerService.FetchallbidsForcustomer(req.user, dto);
  }

  @Get('one-bid/:BidID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Bid>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Bid),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch one bid' })
  async FetccOneBid(
    @Req() req,
    @Param('BidID') BidId: string,
  ): Promise<StandardResponse<Bid>> {
    return await this.customerService.FetchOneBid(req.user, BidId);
  }

  @Patch('bid-action/:BidID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<BidActionResult>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Bid),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({
    summary:
      'accept or decline a bid sent in from the rider and before this action can occur, the rider must have sent in a counter offer first ',
  })
  async AcceptOrDeclineBid(
    @Body() dto: BidActionDto,
    @Req() req,
    @Param('BidID') BidId: string,
  ): Promise<StandardResponse<BidActionResult>> {
    return await this.customerService.CustomerAcceptOrDeclineBid(
      req.user,
      BidId,
      dto,
    );
  }



  @ApiBearerAuth()
  @Post('cancel-ride/:rideID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Bid>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Bid),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({
    summary: 'cancel a ride ',
  })
  async Cancelride(
    @Body() dto: CancelRideDto,
    @Req() req,
    @Param('rideID') rideId: string,
  ): Promise<StandardResponse<Bid>> {
    return await this.customerService.cancelRide(req.user, rideId, dto);
  }


  @ApiBearerAuth()
  @Patch('ratingReview/:rideID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Rides>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Rides),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({
    summary: 'leave a rating and a review in a just concluded ride ',
  })
  async RatingReview(
    @Body() dto: RatingReviewDto,
    @Req() req,
    @Param('rideID') rideId: string,
  ): Promise<StandardResponse<Rides>> {
    return await this.customerService.ratingAndReview(req.user, rideId, dto);
  }



  @Get('one-order/:orderID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Order>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Order),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch one order' })
  async FetccOneOrder(
    @Param('orderD') orderId: string,
  ): Promise<StandardResponse<Order>> {
    return await this.customerService.FetchOneOrder(orderId);
  }



  @Get('all-my-orders')
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(StandardResponse<{ data: Order[]; total: number }>),
        },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Order),
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    description: 'Sorting field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sorting order',
  })
  @ApiOperation({ summary: 'all orders i have placed' })
  async fetchAllMyOrder(
    @Query() dto: PaginationDto,
    @Req()req
  ): Promise<StandardResponse<{ data: Order[]; total: number }>> {
    return await this.customerService.FetchAllMyOrders(dto,req.user);
  }




  @Get('one-transaction/:transactionID')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Transactions>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Transactions),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch one transaction' })
  async FetccOneTransaction(
    @Param('transactionID') orderId: string,
  ): Promise<StandardResponse<Transactions>> {
    return await this.customerService.FetchOneTransaction(orderId);
  }



  @Get('all-my-transactions')
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(StandardResponse<{ data: Transactions[]; total: number }>),
        },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Transactions),
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    description: 'Sorting field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sorting order',
  })
  @ApiOperation({ summary: 'all my transactions' })
  async fetchAllMyTranactions(
    @Query() dto: PaginationDto,
    @Req()req
  ): Promise<StandardResponse<{ data: Transactions[]; total: number }>> {
    return await this.customerService.FetchAllMyTransactions(dto,req.user);
  }

  @Post('testPushNotification')
  async pushNotification():Promise<StandardResponse<any>>{
    return this.customerService.testPushNotification()
  }
}
