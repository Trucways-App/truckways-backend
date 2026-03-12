import {
  ResponseService,
  StandardResponse,
} from 'src/utils/services/response.service';
import {
  BidRepository,
  CartItemRepository,
  OrderCartRepository,
  OrderItemRepository,
  OrderRepository,
  RiderBidResponseRepository,
} from './Infrastructure/Persistence/all-order-repositories';
import { NotificationsService } from 'src/utils/services/notifications.service';
import { GeneratorService } from 'src/utils/services/generator.service';
import { AddParcelToCartDto } from './Dto/add-parcel-to-cart.dto';
import { CloudinaryService } from 'src/utils/services/cloudinary.service';
import { GeoLocationService } from 'src/utils/services/geolocation.service';
import { CartItem } from './Domain/order-cart-items';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';
import { Order } from './Domain/order';
import { BidStatus, OrderStatus, PaymentStatus } from 'src/Enums/order.enum';
import { Injectable } from '@nestjs/common';
import { PaystackCustomer } from 'src/Payment/paystack/paystack-standard-response';
import { PaystackService } from 'src/Payment/paystack/paystack.service';
import { EventsGateway } from 'src/utils/gateway/websocket.gateway';
import { PercentageConfigRepository } from 'src/Admin/Infrastructure/Persistence/admin-repository';
import { PercentageType } from 'src/Enums/percentage.enum';
import { RatingReviewDto } from './Dto/ratingReview.dto';
import { Rides } from 'src/Rider/Domain/rides';
import { PushNotificationsService } from 'src/utils/services/push-notification.service';
import { RiderRepository, TransactionRepository } from 'src/Rider/Infrastructure/Persistence/rider-repository';
import { TransactionStatus, TransactionType } from 'src/Enums/transaction.enum';
import { RiderBidResponseStatus } from './Infrastructure/Persistence/Relational/Entity/bidResponse.entity';
import { WalletService } from 'src/Rider/wallet/wallet.service';

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: OrderCartRepository,
    private orderItemRepository: OrderItemRepository,
    private cartItemRepositor: CartItemRepository,
    private bidRepository: BidRepository,
    private percentageRepository: PercentageConfigRepository,
    private transactionRepositoory: TransactionRepository,
    private riderRepository:RiderRepository,
    private riderBidResponseRepository:RiderBidResponseRepository,
    private responseService: ResponseService,
    private notificationService: NotificationsService,
    private generatorService: GeneratorService,
    private cloudinaryService: CloudinaryService,
    private geolocationService: GeoLocationService,
    private paystackService: PaystackService,
    private walletService:WalletService,

    private readonly eventsGateway: EventsGateway,

    private readonly pushnotificationsService: PushNotificationsService,
  ) {}

  //add items to cart
  async AddParcelToCart(
    customer: CustomerEntity,
    dto: AddParcelToCartDto,
    mediafile: Express.Multer.File,
    cartID: string,
  ): Promise<StandardResponse<CartItem>> {
    try {
      const cart = await this.cartRepository.findByID(
        cartID,
        customer.customerID,
      );
      if (!cart) return this.responseService.notFound('cart not found');

      const load_pics = await this.cloudinaryService.uploadFile(mediafile);
      const mediaurl = load_pics.secure_url;

      const pickupCoordinates =
        await this.geolocationService.getYahooCoordinates(dto.pickup_address);
      const dropOffCoordinates =
        await this.geolocationService.getYahooCoordinates(dto.dropoff_address);

      const cartItemID = `TrkCI${await this.generatorService.generateUserID()}`;

      //add items to cart
      const cartItem = await this.cartItemRepositor.create({
        id: 0,
        cartItemID: cartItemID,
        dropoff_address: dto.dropoff_address,
        pickup_address: dto.pickup_address,
        load_image: mediaurl,
        load_type: dto.load_type,
        load_value: dto.load_value,
        recipient_name: dto.recipient_name,
        recipient_number: dto.recipient_number,
        truck_type: dto.truck_type,
        initial_bid_value: dto.initial_bid_value,
        cart: cart,
        load_description: dto.load_description,
      });

      //save notification
      await this.notificationService.create({
        message: `Item, added to Cart successfully.`,
        subject: 'Item Added To Cart',
        account: customer.customerID, //saves when the user is created
      });

      return this.responseService.success(
        'customer successfully added an item to cart',
        cartItem,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error while adding item to cart',
        error.message,
      );
    }
  }

  async removeItemFromCart(
    customer: CustomerEntity,
    cartID: string,
    CartItemID: string,
  ): Promise<StandardResponse<boolean>> {
    try {
      const cart = await this.cartRepository.findByID(
        cartID,
        customer.customerID,
      );
      if (!cart) return this.responseService.notFound('cart not found');

      if (cart.checkedOut)
        return this.responseService.badRequest(
          'cart has already been checked out',
        );

      //find the cartitem index
      const cartItemIndex = cart.items.findIndex(
        (item) => item.cartItemID === CartItemID,
      );
      if (cartItemIndex === -1)
        return this.responseService.notFound('item in cart not found');

      const removeItem = cart.items.splice(cartItemIndex, 1)[0];
      if (!removeItem)
        return this.responseService.badRequest(
          'failed to remove item from cart',
        );

      //save the cart now
      await this.cartRepository.save(cart);

      //save notification
      await this.notificationService.create({
        message: `Item, ${removeItem.cartItemID} removed from cart successfully.`,
        subject: 'Item Removed from Cart',
        account: customer.customerID, //saves when the user is created
      });

      return this.responseService.success(
        `item ${removeItem.cartItemID} removed from cart successfully`,
        true,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error while removing item from cart',
        error.message,
      );
    }
  }

  async PlaceOrder(
    customer: CustomerEntity,
    cartID: string,
  ): Promise<StandardResponse<Order>> {
    try {
      const cart = await this.cartRepository.findByID(
        cartID,
        customer.customerID,
      );
      if (!cart) return this.responseService.notFound('cart not found');

      if (cart.items.length === 0)
        return this.responseService.badRequest('cart is empty');

      if (cart.checkedOut)
        return this.responseService.badRequest('cart is already checked out');

      const orderID = `TrkO${await this.generatorService.generateUserID()}`;
      const trackingID = `TrkT${await this.generatorService.generateTrackingID()}`;
      const dropoffCode = await this.generatorService.generateDropOffCode();

      //create order
      const order = await this.orderRepository.create({
        id: 0,
        orderID: orderID,
        accepted_bid: 0,
        bid: [],
        trackingID: trackingID,
        dropoffCode: dropoffCode,
        orderStatus: OrderStatus.PENDING,
        Rider: undefined,
        customer: customer,
        createdAT: new Date(),
        paymentStatus: undefined,
        ride: undefined,
        items: [], //will update after creating the items
      });
      console.log('order', order);

      //save order to get its id
      const savedOrder = await this.orderRepository.save(order);
      console.log('savedOrder', savedOrder);

      // Create order items
      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const orderItemID = `TrkOI${await this.generatorService.generateUserID()}`;

          const orderItem = await this.orderItemRepository.create({
            id: 0,
            orderItemID: orderItemID,
            pickup_address: item.pickup_address,
            dropoff_address: item.dropoff_address,
            recipient_name: item.recipient_name,
            recipient_number: item.recipient_number,
            initial_bid_value: item.initial_bid_value,
            load_image: item.load_image,
            load_type: item.load_type,
            load_value: item.load_value,
            truck_type: item.truck_type,
            load_description: item.load_description,
            order: savedOrder,
            droppedOffAT: undefined,
            isDroppedOff: false,
          });

          return await this.orderItemRepository.save(orderItem);
        }),
      );

      console.log('orderItems', orderItems);

      // Create initial bid for each order item
      await Promise.all(
        orderItems.map(async (orderItem) => {
          const bidID = `TrkB${await this.generatorService.generateUserID()}`;

          const initialBid = await this.bidRepository.create({
            id: 0,
            bidID: bidID,
            initialBid_value: orderItem.initial_bid_value,
            bidStatus: BidStatus.BID_SENT,
            order: savedOrder,
            createdAT: new Date(),
            acceptedAT: undefined,
            declinedAT: undefined,
            counteredBid_value: 0,
            counteredAT: undefined,
            bidTypeAccepted: undefined,
            rider: undefined,
          });

          const savedBid = await this.bidRepository.save(initialBid);
          const allRiders = await this.riderRepository.find2();
          await Promise.all(
            allRiders.map(async (rider) => {
              const responseID = `TrkR${await this.generatorService.generateUserID()}`;
              return  await this.riderBidResponseRepository.create({
                responseID: responseID,
                rider: rider,
                bid: savedBid,
                status: RiderBidResponseStatus.NO_RESPONSE,
                isVisible: true,
                id: 0,
                respondedAt: undefined
             
            })
          })
        );

          // Emit WebSocket event for new order with initial bid
          this.eventsGateway.emitToAllRiders('newOrder', {
            orderId: savedOrder.orderID,
            pickup: orderItem.pickup_address,
            dropoff: orderItem.dropoff_address,
            openning_bid: orderItem.initial_bid_value,
            itemDetails: {
              loadType: orderItem.load_type,
              truckType: orderItem.truck_type,
              loadValue: orderItem.load_value,
            },
          });

          //push notifications
          this.pushnotificationsService.notifyAllRidersOfNewOrder(savedOrder);

          return savedBid;
        }),
      );

      // //update cart
      cart.checkedOut = false;
      cart.LastcheckoutedAT = new Date();
      cart.items = [];
      await this.cartRepository.save(cart);

      // Create notification for order placement
      await this.notificationService.create({
        message: `Hello ${customer.name}, your order ${orderID} has been placed successfully.`,
        subject: 'Order Placed',
        account: customer.customerID,
      });

      //fetch completed order
      const completedOrder = await this.orderRepository.findByID(
        savedOrder.orderID,
      );
      console.log('completedOrder', completedOrder);

      return this.responseService.success(
        'Order placed successfully',
        completedOrder,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error placing order or checking out ',
        error.message,
      );
    }
  }

  //pay for agreed orders and bids.
  async PayForOrder(
    customer: CustomerEntity,
    orderId: string,
  ): Promise<StandardResponse<any>> {
    try {
      const order = await this.orderRepository.findByID(orderId);
      if (!order) return this.responseService.notFound('order not found');

      if (order.accepted_bid === null)
        return this.responseService.badRequest(
          'The bid for this order has not being finalized yet, so you cannot proceed with payment',
        );

      //retrieve insurance remittance amount
      const insuranceconfig = await this.percentageRepository.findByType(
        PercentageType.INSURANCE_REMITTANCE,
      );
      if (!insuranceconfig)
        return this.responseService.notFound('insurance percentage not found');

      // Calculate insurance remittance amount
      const acceptedBidAmount = Number(order.accepted_bid);
      const insuranceRemittancePercentage = insuranceconfig.percentage / 100;
      const insuranceRemittanceAmount =
        acceptedBidAmount * insuranceRemittancePercentage;
      const totalPaymentAmount = acceptedBidAmount + insuranceRemittanceAmount;

      //initialize payment
      const PaystackCustomer: PaystackCustomer = {
        email: customer.email,
        full_name: customer.name,
        phone: customer.phoneNumber,
      };

      const transactionID = `TRKT${await this.generatorService.generateUserID()}`;

      const callbackUrl = `https://truckways.onrender.com/api/v1/truckways/v1.0/order/payment/callback?reference=${transactionID}`;


      const paymentResponse = await this.paystackService.PayForOrder(
        Number(totalPaymentAmount),
        PaystackCustomer,
        order,
        transactionID,
        callbackUrl
      );
      console.log(order.accepted_bid);

     
      // Create transaction
      await this.transactionRepositoory.create({
        transactionID,
        amount: totalPaymentAmount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.PENDING,
        reference: transactionID, // Use undefined to match your previous implementation
        description: 'order payment initialization',
        metadata: {
          type: 'order_payment',
          orderReference: order.orderID,
        },
        id: 0,
        createdAT: new Date(),
        customer: customer,
      });

      if (paymentResponse) {
        await this.notificationService.create({
          subject: 'Order Payment Initialized',
          message: `Order Payment initialized successfully`,
          account: customer.customerID,
        });
      }

      return this.responseService.success('Payment successfully Initiated', {
        paymentResponse: paymentResponse.data,
      });
    } catch (error) {
      await this.notificationService.create({
        subject: 'Payment Error',
        message: `failed to process Payment for Order`,
        account: customer.customerID,
      });
      console.error(error);
      return this.responseService.internalServerError(
        'Error while initializing order Payment',
      );
    }
  }



  //process payments
  async processEventPayment(reference: string): Promise<StandardResponse<any>> {
    try {
      const verificationResponse =
        await this.paystackService.verifyTransaction(reference);

      if (!verificationResponse.status) {
        return this.responseService.badRequest(
          'Transaction verification failed',
        );
      }

      if (verificationResponse.status === 'pending') {
        return this.responseService.badRequest(
          'Payment Pending, retry after 20 secs',
        );
      }

      //idopodency checks
      const existingTransaction =
        await this.transactionRepositoory.findByID(reference);
      if (existingTransaction?.status === TransactionStatus.SUCCESSFUL) {
        return this.responseService.badRequest('payment already processed');
      }

      return this.transactionRepositoory.executeWithTransaction(
        async (repository) => {
          const transaction = await repository.findOne({
            where: { reference: reference },
            relations: ['customer'],
          });

          if (
            !transaction ||
            transaction.status !== TransactionStatus.PENDING
          ) {
            return this.responseService.badRequest(
              `Invalid transaction for reference: ${reference}`,
            );
          }

          // verify amount
          const expectedAmount = Number(transaction.amount);
          const receivedAmount = Number(verificationResponse.amount / 100);

          if (expectedAmount !== receivedAmount) {
            return this.responseService.badRequest(
              `Amount mismatch: Expected ${expectedAmount}, got ${receivedAmount}`,
            );
          }

          transaction.status = TransactionStatus.SUCCESSFUL;
          await repository.save(transaction);

          //update the order payment
          const order = await this.orderRepository.findByID(
            transaction.metadata.orderReference,
          );
          if (!order)
            return this.responseService.badRequest(
              `Order with ID ${reference} not found`,
            );

          order.paymentStatus = PaymentStatus.SUCCESFUL;

          await this.orderRepository.save(order);

          //fund wallet 

          // Fund wallet - FIXED: await the result and handle properly
        const walletFundingResult = await this.walletService.FundWallet(
          order.Rider.riderID, 
          order.orderID
        );
          
        if (!walletFundingResult.success) {
          console.error('Wallet funding failed:', walletFundingResult.message);
          // We continue processing but log the error
        }

          await this.notificationService.create({
            subject: `${transaction.type} successful Payment Notification`,
            message: `${transaction.customer.name} has successfully paid for ${transaction.type} }`,
            account: transaction.customer.customerID,
          });

          return this.responseService.success('order payment verified', {
            transactionReference: reference,
          });
        },
      );
    } catch (error) {
      console.log(error);
      throw new Error('error processing order payment');
    }
  }

  //track order
  async TrackOrder(keyword: string): Promise<StandardResponse<Order>> {
    try {
      const order = await this.orderRepository.trackOrder(keyword);

      if (!order)
        return this.responseService.notFound(
          `no trackingID was found matching keyword ${keyword}`,
        );

      return this.responseService.success(
        `order details retrieved successfully for ${keyword}`,
        order,
      );
    } catch (error) {
      console.error(error);
      return this.responseService.internalServerError(
        'Error tracking Order',
        error.message,
      );
    }
  }
}
