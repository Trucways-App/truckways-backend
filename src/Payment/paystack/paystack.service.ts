import { Injectable } from '@nestjs/common';
import { PayStackConfig } from './paystack.config';
import {
  CustomAxiosResponse,
  CustomAxiosService,
} from './custom.axios-service';
import {
  InitializeTransactionResponse,
  PayStaackStandardResponse,
  PaystackCustomer,
  VerifyTransactionResponse,
} from './paystack-standard-response';
import { v4 as uuidv4 } from 'uuid';
import { OrderEntity } from 'src/Order/Infrastructure/Persistence/Relational/Entity/order.entity';
import { WalletEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/wallet.entity';

interface TransferRecipientParams {
  accountNumber: string;
  bankCode: string;
  accountName: string;
}

interface TransferParams {
  amount: number;
  recipientCode: string;
  reference: string;
}

@Injectable()
export class PaystackService {
  private readonly _config: PayStackConfig;
  private readonly _axiosService: CustomAxiosService;
  constructor(private customAxiosService: CustomAxiosService) {
    //set tapi key in the header

    this._config = PayStackConfig.fromEnv();
    this._axiosService = this.customAxiosService;
    this._axiosService.init({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this._config.secretKey}`,
    });
  }

  public PayForOrder = async (
    amount: number,
    customer: PaystackCustomer,
    order: OrderEntity,
    transactionId:string,
    callbackUrl:string
  ) => {
    const reference = order.orderID;
    const response = await this._axiosService.post<
      PayStaackStandardResponse<InitializeTransactionResponse>
    >(`${this._config.baseUrl}/transaction/initialize`, {
      amount: amount * 100, // Convert to kobo (Paystack expects amount in kobo)
      email: customer.email,
      reference:transactionId,
      callback_url: callbackUrl,
      metadata: {
        customer_fields: {
          fullname: customer.full_name,
          phone: customer.phone,
        },
        type: 'truckways_order_delivery_payment',
      },
    });

    return response;
  };

  public TransferToWallet = async (
    amount: number,
    customer: PaystackCustomer,
    wallet: WalletEntity,
  ) => {
    const reference = wallet.walletAddrress;
    const response = await this._axiosService.post<
      PayStaackStandardResponse<InitializeTransactionResponse>
    >(`${this._config.baseUrl}/transaction/initialize`, {
      amount: amount * 100, // Convert to kobo (Paystack expects amount in kobo)
      email: customer.email,
      reference,
      //callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: {
        customer_fields: {
          fullname: customer.full_name,
          phone: customer.phone,
        },
        type: 'wallet_transfer',
      },
    });

    return response;
  };
  async createTransferRecipient(details: TransferRecipientParams) {
    try {
      // Explicitly set headers for each request
      this._axiosService.init({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.secretKey}`,
      });

      const response = await this._axiosService.post<any>(
        `${this._config.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name: details.accountName,
          account_number: details.accountNumber,
          bank_code: details.bankCode,
          currency: 'NGN',
        },
      );

      if (!response.data.status) {
        throw new Error('Transfer failed: ' + JSON.stringify(response.data));
      }

      return response;

      // Rest of the code remains the same
    } catch (error) {
      throw new Error(`Transfer recipient creation failed: ${error.message}`);
    }
  }

  async initiateTransfer(params: TransferParams) {
    try {
      this._axiosService.init({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.secretKey}`,
      });

      const response = await this._axiosService.post<any>(
        `${this._config.baseUrl}/transfer`,
        {
          source: 'balance',
          amount: params.amount * 100,
          recipient: params.recipientCode,
          reference: params.reference,
          reason: 'Wallet withdrawal',
        },
      );

      // Add validation
      if (!response.data.status) {
        throw new Error('Transfer failed: ' + JSON.stringify(response.data));
      }

      return response;
    } catch (error) {
      throw new Error(`Transfer initiation failed: ${error.message}`);
    }
  }

  async finalizeTransfer(transferCode: string, otp: string) {
    try {
      this._axiosService.init({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.secretKey}`,
      });

      const response = await this._axiosService.post<any>(
        `${this._config.baseUrl}/transfer/finalize_transfer`,
        {
          transfer_code: transferCode,
          otp: otp,
        },
      );

      if (!response.data.status) {
        throw new Error(
          'Finalizing transfer failed: ' + JSON.stringify(response.data),
        );
      }

      return response;
    } catch (error) {
      throw new Error(`Finalizing transfer failed: ${error.message}`);
    }
  }

  public verifyTransfer = async (reference: string) => {
    try {
      this._axiosService.init({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.secretKey}`,
      });

      const response = await this._axiosService.get<any>(
        `${this._config.baseUrl}/transfer/verify/${reference}`,
      );

      if (!response.data.status) {
        throw new Error(
          'Verifying  transfer failed: ' + JSON.stringify(response.data),
        );
      }

      return response;
    } catch (error) {
      throw new Error(`Verifying transaction  failed: ${error.message}`);
    }
  };



  async verifyTransaction(reference: string): Promise<{
    status: string;
    reference: string;
    amount: number;
    email: string;
    message?: string;
  }> {
    try {
      this._axiosService.init({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.secretKey}`,
      });

      const verificationResponse = await this._axiosService.get<
        PayStaackStandardResponse<VerifyTransactionResponse>
      >(`${this._config.baseUrl}/transaction/verify/${reference}`, {
        timeout: 10000,
      });

      if (!verificationResponse) {
        throw new Error('No response from Paystack');
      }

      const paymentData = verificationResponse.data;

      if (!paymentData) throw new Error('no paystack data returned ')

      // Handle Paystack API-level errors (e.g., invalid reference)
      if (!paymentData.status) {
        return {
          status: 'failed',
          reference,
          amount: 0,
          email: '',
          message: paymentData.message || 'Verification failed',
        };
      }

      const transactionData = paymentData.data;

      return {
        status: transactionData.status, // 'success', 'pending', 'failed'
        reference: transactionData.reference,
        amount: transactionData.amount,
        email: transactionData.customer?.email || '',
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        status: 'error',
        reference,
        amount: 0,
        email: '',
        message: error.message,
      };
    }
  }
}
