import { ApiProperty } from "@nestjs/swagger";

export class PayStaackStandardResponse<T> {
    @ApiProperty({ type: Boolean })
    status: boolean;
  
    @ApiProperty({ type: String })
    message: string;
  
    @ApiProperty({ type: Object })
    data: T;
    reference:string;
 
  
    constructor(status: boolean, message: string, data: T) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  }
  


  export interface InitializeTransactionResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
  }

  export interface PaystackCustomer {
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?:string
    phone?: string;
  }

  export interface VerifyTransactionResponse {
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    currency: string;
    customer: PaystackCustomer;
    metadata: Record<string, any>;
  }