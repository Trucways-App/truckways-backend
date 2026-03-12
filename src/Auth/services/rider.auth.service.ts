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
import { SignupDto } from '../dto/signup.dto';
import { Role } from 'src/Enums/users.enum';
import { VerifficationType } from 'src/Enums/verification.enum';
import { RiderRepository } from 'src/Rider/Infrastructure/Persistence/rider-repository';
import { Rider } from 'src/Rider/Domain/rider';
import { devicetokenDto } from '../dto/devicetoken.dto';
import { RiderEntity } from 'src/Rider/Infrastructure/Persistence/Relational/Entity/rider.entity';

@Injectable()
export class RiderAuthService {
  constructor(
    private responseService: ResponseService,
    private notificationService: NotificationsService,
    private riderRepository: RiderRepository,
    private generatorService: GeneratorService,
    private mailService: MailService,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
  ) {}

  // profile / me
  async Profile(rider: RiderEntity): Promise<StandardResponse<Rider>> {
    try {
      const profile = await this.riderRepository.profile(rider);
      return this.responseService.success(
        'Rider profile fetched successfully',
        {
          ...profile,
        },
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error fetching Rider Profile',
        error.message,
      );
    }
  }

  async deviceToken(
    rider: RiderEntity,
    dto: devicetokenDto,
  ): Promise<StandardResponse<Rider>> {
    try {
      const profile = await this.riderRepository.findByID(rider.id);
      if (!profile) return this.responseService.notFound('user not found');
      profile.deviceToken = dto.deviceToken;

      const savedProfile = await this.riderRepository.save(profile);

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
  async singUpRider(dto: SignupDto): Promise<StandardResponse<Rider>> {
    try {
      const { email, name, password } = dto;
      const isEmail = await this.riderRepository.findByEmail(email);
      if (isEmail)
        return this.responseService.badRequest('email already exists');

      const hashpassword = await this.generatorService.hashpassword(password);
      const riderIdcustom = `TrkR${await this.generatorService.generateUserID()}`;

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
          role: Role.RIDER,
          Verification_mode: VerifficationType.AUTHENTICATION,
          expiration_time: twominutelater,
        }),
      );
      //send email first before saving the user incase of any problem
      await this.mailService.VerifyOtpMail(email, otpCode);

      const user = await this.riderRepository.create({
        email: email,
        name: name,
        phoneNumber: undefined,
        password: hashpassword,
        riderID: riderIdcustom,
        id: 0,
        deviceToken: undefined,
        profilePicture: '',
        role: Role.RIDER,
        createdAT: new Date(),
        updatedAT: undefined,
        emailConfirmed: false,
        isAprroved: false,
        isBlocked: false,
        resetPasswordToken: '',
        resetPasswordTokenExpTime: undefined,
        driversLicenceBack: undefined,
        driversLicenceFront: undefined,
        address: {
          address: '',
          lat: 0,
          lon: 0,
        },
        my_wallet: undefined,
        city: '',
        state: '',
        companyRegNum: '',
        RiderStatus: undefined,
        vehicle: undefined,
        bank_details: undefined,
        accepted_orders: [],
        accepted_bids: [],
        my_transactions: [],
        rides: [],
      });

      //save notification
      await this.notificationService.create({
        message: `Welcome ${name}, your account has been created successfully.`,
        subject: 'Rider Account Creation',
        account: (await user).riderID, //saves when the user is created
      });

      return this.responseService.success(
        'rider registered successfully,please check email provided for the otpCode',
        user,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error occured during Signup',
        error.message,
      );
    }
  }

  // verify otp
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

      const rider = await this.riderRepository.findByEmail(isOtp.email);
      if (!rider)
        return this.responseService.notFound(
          'user associated to otp not found',
        );

      //update the user model
      rider.emailConfirmed = true;
      rider.updatedAT = new Date();

      await this.riderRepository.save(rider);

      // Generate and return JWT token
      const token = await this.generatorService.signToken(
        rider.id,
        rider.email,
        rider.role,
      );

      //save notification
      await this.notificationService.create({
        message: `Hello ${rider.name}, your account has been verified successfully.`,
        subject: 'Email Verification',
        account: rider.riderID,
      });

      return this.responseService.success('email verified successfully', {
        rider: rider,
        onboardingToken: token,
      });
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

      const rider = await this.riderRepository.findByEmail(dto.email);
      if (!rider)
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
        message: `Hi ${rider.name}, otp resent after two minutes.`,
        subject: 'OTP resent After two Minutes',
        account: rider.riderID,
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
      const rider = await this.riderRepository.findByEmail(dto.email);
      if (!rider)
        return this.responseService.notFound('this email is not found');

      //generate and update otp
      const resetOtp = await this.generatorService.generateEmailToken();

      // Send resetOTP via email
      await this.mailService.ForgotPasswordMail(dto.email, resetOtp);

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);
      rider.resetPasswordToken = resetOtp;
      rider.resetPasswordTokenExpTime = expirationTime;
      await this.riderRepository.save(rider);

      await this.notificationService.create({
        message: `Hi ${rider.name}, password reset otp sent.`,
        subject: 'Password Reset otp sent',
        account: rider.riderID,
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
      const findresetOtp = await this.riderRepository.findbyPasswordResetToken(
        dto.otp,
      );
      if (!findresetOtp)
        return this.responseService.notFound(
          'reset password token not a match',
        );

      if (findresetOtp.resetPasswordTokenExpTime <= new Date())
        return this.responseService.badRequest('reset password token expired');

      await this.notificationService.create({
        message: `Hi ${findresetOtp.name}, password reset otp verified.`,
        subject: 'Password Reset otp verified',
        account: findresetOtp.riderID,
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
      const rider = await this.riderRepository.findByEmail(dto.email);
      if (!rider)
        return this.responseService.badRequest(
          'email not associated with any user',
        );

      if (!rider.emailConfirmed)
        return this.responseService.badRequest('user is not verified yet');
      //hash new password
      const hashpassword = await this.generatorService.hashpassword(
        dto.password,
      );

      rider.password = hashpassword;
      (rider.resetPasswordToken = null),
        (rider.resetPasswordTokenExpTime = null);

      await this.riderRepository.save(rider);

      await this.notificationService.create({
        message: `Hi ${rider.name}, password reset sucessful.`,
        subject: 'Password Reset',
        account: rider.riderID,
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
      const rider = await this.riderRepository.findByEmail(dto.email);
      if (!rider) return this.responseService.notFound('Invalid credentials');
  
      const comparePassword = await this.generatorService.comaprePassword(
        dto.password,
        rider.password,
      );
      if (!comparePassword)
        return this.responseService.notFound('Invalid credentials');
  
      // Check if email is confirmed
      if (!rider.emailConfirmed)
        return this.responseService.badRequest(
          'Your account is not verified yet. Please check your email for verification instructions.',
        );
  
      // Check if rider is blocked
      if (rider.isBlocked)
        return this.responseService.badRequest(
          'Your account has been suspended. Please contact our support team via email to resolve this issue.',
        );
        
      // Convert onboardingPercentage to a number for comparison (since it appears to be stored as a string)
      const onboardingPercent = Number(rider.onboardingPercentage);
      
      // Check if onboarding is complete (100%)
      if (onboardingPercent < 100) {
        const pendingSteps = [];
  
        if (!rider.onboardingStatus?.Personal_Profile) {
          pendingSteps.push('Personal Profile');
        }
        if (!rider.onboardingStatus?.Vehicle_Profile) {
          pendingSteps.push('Vehicle Profile');
        }
        if (!rider.onboardingStatus?.Payment_Profile) {
          pendingSteps.push('Payment Profile');
        }
  
        const pendingStepsText =
          pendingSteps.length > 0
            ? `You still need to complete: ${pendingSteps.join(', ')}.`
            : '';
  
        // Generate temporary token for onboarding completion
        const onboardingToken = await this.generatorService.signToken(
          rider.id,
          rider.email,
          rider.role,
           // Add claims to identify this as temp token
        );
  
        return this.responseService.success(
          `Welcome back! Your profile is ${rider.onboardingPercentage}% complete. ${pendingStepsText} We've provided a temporary access token to help you complete your onboarding.`,
          { rider: rider, token: onboardingToken, isOnboardingToken: true },
        );
      }
      
      // At this point, onboarding is 100% complete
      
      // Now check for approval status (only check this if onboarding is complete)
      if (!rider.isAprroved) {
        return this.responseService.badRequest(
          'Your account is pending approval from Truckways Management. Please try again after you receive the approval email. Thank you for your patience.',
        );
      }
  
      // User is fully onboarded and approved - generate full access token
      const token = await this.generatorService.signToken(
        rider.id,
        rider.email,
        rider.role,
      );
  
      await this.notificationService.create({
        message: `Hi ${rider.name}, you've logged in successfully.`,
        subject: 'User Login',
        account: rider.riderID,
      });
  
      return this.responseService.success('Login successful', {
        token: token,
        user: rider,
      });
    } catch (error) {
      return this.responseService.internalServerError(
        'Error logging in',
        error.message,
      );
    }
  }
}
