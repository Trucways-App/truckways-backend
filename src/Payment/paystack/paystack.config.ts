import { Injectable } from "@nestjs/common";

@Injectable()
export class PayStackConfig {
    secretKey: string;
    publicKey: string;
    baseUrl: string;
    callbackUrl: string;

    constructor(
        secretKey: string, 
        publicKey: string, 
        baseUrl: string, 
        callbackUrl: string
    ) {
        this.secretKey = secretKey;
        this.publicKey = publicKey;
        this.baseUrl = baseUrl;
        this.callbackUrl = callbackUrl;
    }

    static fromEnv(): PayStackConfig {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        const publicKey = process.env.PAYSTACK_PUBLIC_KEY;
        const baseUrl = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
        const callbackUrl = process.env.PAYSTACK_CALLBACK_URL;

        if (!secretKey || !publicKey || !callbackUrl) {
            throw new Error('Missing Paystack configuration. Please check your environment variables.');
        }

        return new PayStackConfig(secretKey, publicKey, baseUrl, callbackUrl);
    }
}