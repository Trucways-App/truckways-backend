// paystack-webhook.service.ts
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { NotificationsService } from 'src/utils/services/notifications.service';
import { WalletService } from 'src/Rider/wallet/wallet.service';
import { OrderRepository } from 'src/Order/Infrastructure/Persistence/all-order-repositories';
import { PaystackService } from '../paystack/paystack.service';
import { PaymentStatus } from 'src/Enums/order.enum';

interface PaystackEventData {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: {
      type?: string;
      customer_fields?: {
        fullname?: string;
        phone?: string;
      };
    };
  };
}

@Injectable()
export class PaystackWebhookService {
  constructor(
    private configService: ConfigService,
    private paystackService: PaystackService,
    private walletService: WalletService,
    private orderRepository: OrderRepository,
    private notificationsService: NotificationsService
  ) {}

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      res.status(400).send('Missing signature');
      return;
    }

    const hash = crypto
      .createHmac('sha512', this.configService.get<string>('PAYSTACK_SECRET_KEY'))
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      res.status(401).send('Invalid signature');
      return;
    }

    const event = req.body as PaystackEventData;

    try {
      switch (event.event) {
        case 'charge.success':
          await this.handleOrderPayment(event.data);
          break;
        case 'transfer.success':
          await this.walletService.processWithdrawalSuccess(event.data.reference);
          break;
        case 'event.unknown':
        default:
          console.warn('Unhandled event type:', event.event);
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook Processing Error:', error);
      await this.notificationsService.create({
        subject: 'Webhook Processing Failed',
        message: `Event: ${event.event} | Ref: ${event.data.reference} | Error: ${error.message}`,
        account: 'admin'
      });
      res.status(500).send('Processing failed');
    }
  }

  private async handleOrderPayment(data: PaystackEventData['data']) {
    // const verification = await this.paystackService.verifyTransaction(data.reference);
    // if (!verification.data.status) {
    //   throw new Error('Payment verification failed');
    // }

    const order = await this.orderRepository.findByID(data.reference);
    if (!order) {
      throw new Error(`Order not found: ${data.reference}`);
    }

    order.paymentStatus = PaymentStatus.SUCCESFUL;
    await this.orderRepository.save(order);

    // Trigger wallet funding after successful order payment
    if (order.Rider) {
      await this.walletService.FundWallet(
        order.Rider.riderID,
        order.orderID
      );
    }

    await this.notificationsService.create({
      subject: 'Payment Received',
      message: `Payment of ${data.amount / 100} processed successfully`,
      account: order.customer.customerID
    });
  }
}