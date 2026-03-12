import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/utils/services/notifications.service';
import {
  ResponseService,
  StandardResponse,
} from 'src/utils/services/response.service';
import { GeneratorService } from 'src/utils/services/generator.service';
import { MailService } from 'src/mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpEntity } from 'src/utils/shared-entities/otp.entity';
import { VerifyOtp } from '../dto/verify-otp.dto';
import { ResendExpiredOtp } from '../dto/resend-expired-otp.dto';
import { RequestPasswordResetOtp } from '../dto/password-reset-dto';
import { ResetPasswordDto } from '../dto/reset-password-otp.dto';
import { LoginDto } from '../dto/login.dto';
import { CustomerRepository } from 'src/Customer/Infrastructure/Persistence/customer-repository';
import { Customer } from 'src/Customer/Domain/customer';
import { SignupDto } from '../dto/signup.dto';
import { Role } from 'src/Enums/users.enum';
import { VerifficationType } from 'src/Enums/verification.enum';
import { OrderCartRepository } from 'src/Order/Infrastructure/Persistence/all-order-repositories';
import { CustomerEntity } from 'src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity';
import { devicetokenDto } from '../dto/devicetoken.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private responseService: ResponseService,
    private notificationService: NotificationsService,
    private customerRepository: CustomerRepository,
    private cartRepository: OrderCartRepository,
    private generatorService: GeneratorService,
    private mailService: MailService,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
  ) {}

  // profile / me
  async Profile(customer: Customer): Promise<StandardResponse<Customer>> {
    try {
      const profile = await this.customerRepository.profile(customer);
      return this.responseService.success(
        'Customer profile fetched successfully',
        {
          ...profile,
        },
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching Customer Profile',
        error.message,
      );
    }
  }

  async deviceToken(
    customer: Customer,
    dto: devicetokenDto,
  ): Promise<StandardResponse<Customer>> {
    try {
      const profile = await this.customerRepository.findByID(customer.id);
      if (!profile) return this.responseService.notFound('user not found');
      profile.deviceToken = dto.deviceToken;

      const savedProfile = await this.customerRepository.save(profile);

      return this.responseService.success(
        'Device token Added successfully',
        savedProfile,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error adding Device token',
        error.message,
      );
    }
  }

  // sign up fo professional planner
  async singUpCustomer(dto: SignupDto): Promise<StandardResponse<Customer>> {
    try {
      const { email, name, password } = dto;
      const isEmail = await this.customerRepository.findByEmail(email);
      if (isEmail)
        return this.responseService.badRequest('email already exists');

      const hashpassword = await this.generatorService.hashpassword(password);
      const customerIdcustom = `TrkC${await this.generatorService.generateUserID()}`;

      //create and save otp
      const otpCode = await this.generatorService.generateEmailToken();
      console.log(otpCode);
      let now = new Date();

      const twominutelater = new Date(now.getTime() + 120000);

      await this.otpRepository.save(
        this.otpRepository.create({
          otp: otpCode,
          created_at: new Date(),
          email: email,
          role: Role.CUSTOMER,
          Verification_mode: VerifficationType.AUTHENTICATION,
          expiration_time: twominutelater,
        }),
      );
      //send email first before saving the user incase of any problem
      await this.mailService.VerifyOtpMail(email, otpCode);

      const user = await this.customerRepository.create({
        email: email,
        name: name,
        phoneNumber: undefined,
        password: hashpassword,
        customerID: customerIdcustom,
        id: 0,
        deviceToken: undefined,
        profilePicture: '',
        role: Role.CUSTOMER,
        createdAT: new Date(),
        updatedAT: undefined,
        isVerified: false,
        resetPasswordToken: '',
        resetPasswordTokenExpTime: undefined,
        altrnatePhoneNumber: '',
        address: {
          address: '',
          lat: 0,
          lon: 0,
        },
        my_cart: undefined,
        my_orders: [],
        my_transaction: []
      });

      //save notification
      await this.notificationService.create({
        message: `Welcome ${name}, your account has been created successfully.`,
        subject: 'Customer Account Creation',
        account: (await user).customerID, //saves when the user is created
      });

      return this.responseService.success(
        'customer registered successfully,please check email provided for the otpCode',
        user,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error occured during Signup',
        error.message,
      );
    }
  }
  async verifyOtp(dto: VerifyOtp): Promise<StandardResponse<any>> {
    try {
      const isOtp = await this.otpRepository.findOne({
        where: {
          otp: dto.otp,
          Verification_mode: dto.verificationType,
        },
      });

      if (dto.verificationType !== VerifficationType.AUTHENTICATION)
        return this.responseService.badRequest(
          'otp type must be of type verification',
        );

      if (!isOtp) return this.responseService.notFound('otp not found');

      if (isOtp.expiration_time <= new Date())
        return this.responseService.badRequest('otp is expired');

      const customer = await this.customerRepository.findByEmail(isOtp.email);
      if (!customer)
        return this.responseService.notFound(
          'user associated to otp not found',
        );

      (customer.isVerified = true), (customer.updatedAT = new Date());
      await this.customerRepository.save(customer);

      // Fetch the updated customer
      const updatedCustomer = await this.customerRepository.findByEmail(
        isOtp.email,
      );

      // Update OTP to mark it as verified
      await this.otpRepository.update(isOtp.id, {
        verified: true,
      });

      // Create cart for customer
      const cartID = `TrkCusC${await this.generatorService.generateUserID()}`;

      const cart = await this.cartRepository.create({
        id: 0,
        createdAt: new Date(),
        LastcheckoutedAT: undefined,
        checkedOut: false,
        items: [],
        orderCartID: cartID,
        customer: customer as CustomerEntity,
      });

     

      // Save notification
      await this.notificationService.create({
        message: `Hello ${updatedCustomer.name}, your account has been verified successfully and order Cart created.`,
        subject: 'Email Verification',
        account: updatedCustomer.customerID,
      });

      return this.responseService.success(
        'email verified successfully and customer Cart created',
        { customer: updatedCustomer, cart: cart },
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error verifying email',
        error.message,
      );
    }
  }

  //resend expired otp
  async resendOtp(dto: ResendExpiredOtp): Promise<StandardResponse<boolean>> {
    try {
      const findexpiredotp = await this.otpRepository.findOne({
        where: { email: dto.email },
      });
      if (!findexpiredotp)
        return this.responseService.notFound(
          `no otp found for user with email:  ${dto.email}`,
        );

      const now = new Date();
      if (now < findexpiredotp.expiration_time)
        return this.responseService.badRequest(' current otp not expired yet');

      const customer = await this.customerRepository.findByEmail(dto.email);
      if (!customer)
        return this.responseService.notFound(
          'no user is associated with this otp',
        );

      //generate and update otp
      const otpCode = await this.generatorService.generateEmailToken();

      const twominutelater = new Date(now.getTime() + 120000);

      await this.otpRepository.update(findexpiredotp.id, {
        otp: otpCode,
        verified: false,
        expiration_time: twominutelater,
      });

      // Send new OTP via email
      await this.mailService.VerifyOtpMail(dto.email, otpCode);

      await this.notificationService.create({
        message: `Hi ${customer.name}, otp resent after two minutes.`,
        subject: 'OTP resent After two Minutes',
        account: customer.customerID,
      });

      return this.responseService.success('otp resent successfully', true);
    } catch (error) {
      return this.responseService.internalServerError(
        'Error resending otp',
        error.message,
      );
    }
  }

  // send reset password otp
  async SendResetPasswordOtp(
    dto: RequestPasswordResetOtp,
  ): Promise<StandardResponse<boolean>> {
    try {
      const customer = await this.customerRepository.findByEmail(dto.email);
      if (!customer)
        return this.responseService.notFound('this email is not found');

      //generate and update otp
      const resetOtp = await this.generatorService.generateEmailToken();

      // Send resetOTP via email
      await this.mailService.ForgotPasswordMail(dto.email, resetOtp);

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);
      customer.resetPasswordToken = resetOtp;
      customer.resetPasswordTokenExpTime = expirationTime;
      await this.customerRepository.save(customer);

      await this.notificationService.create({
        message: `Hi ${customer.name}, password reset otp sent.`,
        subject: 'Password Reset otp sent',
        account: customer.customerID,
      });

      return this.responseService.success(
        'Password reset otp sent successfully',
        true,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error sending Password reset otp ',
        error.message,
      );
    }
  }

  //verify password reset otp
  async verifyResetPasswordOtp(
    dto: VerifyOtp,
  ): Promise<StandardResponse<boolean>> {
    try {
      const findresetOtp =
        await this.customerRepository.findbyPasswordResetToken(dto.otp);
      if (!findresetOtp)
        return this.responseService.notFound(
          'reset password token not a match',
        );

      if (findresetOtp.resetPasswordTokenExpTime <= new Date())
        return this.responseService.badRequest('reset password token expired');

      await this.notificationService.create({
        message: `Hi ${findresetOtp.name}, password reset otp verified.`,
        subject: 'Password Reset otp verified',
        account: findresetOtp.customerID,
      });

      return this.responseService.success(
        'password reset otp verified successfully',
        true,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error verifying reset password otp',
        error.message,
      );
    }
  }

  //reset password
  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<StandardResponse<boolean>> {
    try {
      const customer = await this.customerRepository.findByEmail(dto.email);
      if (!customer)
        return this.responseService.badRequest(
          'email not associated with any user',
        );

      if (!customer.isVerified)
        return this.responseService.badRequest('user is not verified yet');
      //hash new password
      const hashpassword = await this.generatorService.hashpassword(
        dto.password,
      );

      customer.password = hashpassword;
      (customer.resetPasswordToken = null),
        (customer.resetPasswordTokenExpTime = null);

      await this.customerRepository.save(customer);

      await this.notificationService.create({
        message: `Hi ${customer.name}, password reset sucessful.`,
        subject: 'Password Reset',
        account: customer.customerID,
      });

      return this.responseService.success('password reset successful', true);
    } catch (error) {
      return this.responseService.internalServerError(
        'Error reseting password',
        error.message,
      );
    }
  }

  // login
  async Login(dto: LoginDto): Promise<StandardResponse<any>> {
    try {
      const customer = await this.customerRepository.findByEmail(dto.email);
      if (!customer) return this.responseService.notFound('invalid credential');

      const comparePassword = await this.generatorService.comaprePassword(
        dto.password,
        customer.password,
      );
      if (!comparePassword)
        return this.responseService.notFound('invalid credential');

      if (!customer.isVerified)
        return this.responseService.badRequest('user is not verified yet');

      await this.notificationService.create({
        message: `Hi ${customer.name}, logged in successfully.`,
        subject: 'User Login',
        account: customer.customerID,
      });

      // Generate and return JWT token
      const token = await this.generatorService.signToken(
        customer.id,
        customer.email,
        customer.role,
      );

      return this.responseService.success('log in successful', {
        token: token,
        user: customer,
      });
    } catch (error) {
      return this.responseService.internalServerError(
        'Error logging in',
        error.message,
      );
    }
  }
}
