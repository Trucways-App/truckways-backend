import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nanoid from 'nanoid';
import { customAlphabet } from 'nanoid';


@Injectable()
export class GeneratorService {
  constructor(
    private configservice: ConfigService,
    private jwt: JwtService,
  ) {}

  public async hashpassword(password): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  public async comaprePassword(userpassword, dbpassword): Promise<boolean> {
    return await bcrypt.compare(userpassword, dbpassword);
  }

  public generateEmailToken(): string {
    const gen = customAlphabet('12345678990', 6);
    return gen();
  }

  public generateUUID(): string {
    const gen = customAlphabet(
      '12345678990abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      12,
    );
    return gen();
  }


  //access token
  public async signToken(id: number, email: string, role: string) {
    const payload = {
      sub: id,
      email,
      role,
    };
    const secret = this.configservice.get('AUTH_JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.configservice.get('AUTH_JWT_TOKEN_EXPIRES_IN'),
      secret: secret,
    });
    return { token: token };
  }


 
  public generateTransactionCode(): string {
    const gen = nanoid.customAlphabet('1234567890', 12);
    return gen();
  }

  public generateOrderID(): string {
    const gen = nanoid.customAlphabet(
      '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      8,
    );
    return gen();
  }

  public generateUserID(): string {
    const gen = nanoid.customAlphabet(
      '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      6,
    );
    return gen();
  }


  public generateWalletAddress(): string {
    const gen = nanoid.customAlphabet(
      '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      18,
    );
    return gen();
  }

  public generatePassword(): string {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ@#*!(){}[]/|``^&$',
      12,
    );
    return nanoid();
  }

  public generatEmailSuffixNumber(): string {
    const nanoid = customAlphabet('1234567890', 2);
    return nanoid();
  }

  public generateComplaintTcket(): string {
    const nanoid = customAlphabet('1234567890', 10);
    return nanoid();
  }

  //generaete
  public generateTrackingID(): string {
    const trackingcode = nanoid.customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyz',
      8,
    );
    return trackingcode();
  }

  //generaete drop off code
  public generateDropOffCode(): string {
    const dropoffcode = nanoid.customAlphabet('1234567890', 6);
    return dropoffcode();
  }

  //generaete drop off code
  public generatereceiptID(): string {
    const dropoffcode = nanoid.customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyz',
      7,
    );
    return dropoffcode();
  }

  public generateBarcodeGigits(): string {
    const barcode = nanoid.customAlphabet('1234567890', 15);
    return barcode();
  }

  async formatPhoneNumber(phone: string): Promise<string | null> {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if the number starts with '0' and is 11 digits long (for Nigerian numbers)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      // Replace leading '0' with '+234'
      return `+234${cleaned.substring(1)}`;
    }

    // Check if the number is already in international format
    if (cleaned.startsWith('234') && cleaned.length === 13) {
      return `+${cleaned}`;
    }

    // Invalid number format
    return null;
  }

  
}
