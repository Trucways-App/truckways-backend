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
import { AdminEntity } from 'src/Admin/Infrastructure/Persistence/Relational/Entity/admin.entity';
import { Admin } from 'src/Admin/Domain/admin';
import { AdminRepository } from 'src/Admin/Infrastructure/Persistence/admin-repository';

@Injectable()
export class AdminAuthService {
  constructor(
    private responseService: ResponseService,
    private notificationService: NotificationsService,
    private adminRepository: AdminRepository,
    private generatorService: GeneratorService,
    private mailService: MailService,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
  ) {}

  // profile / me
  async Profile(admin: AdminEntity): Promise<StandardResponse<Admin>> {
    try {
      const profile = await this.adminRepository.profile(admin);
      return this.responseService.success(
        'admin profile fetched successfully',
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


  // sign up fo professional planner
  async singUpAdmin(dto: SignupDto): Promise<StandardResponse<Admin>> {
    try {
      const { email, name, password } = dto;
      const isEmail = await this.adminRepository.findByEmail(email);
      if (isEmail)
        return this.responseService.badRequest('email already exists');

      const hashpassword = await this.generatorService.hashpassword(password);
      const adminIdcustom = `TrkA${await this.generatorService.generateUserID()}`;

      //create and save otp
      const otpCode = await this.generatorService.generateEmailToken();
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

      const user = await this.adminRepository.create({
        email:email,
        name:name,
        phoneNumber: undefined,
        password: hashpassword,
        adminID: adminIdcustom,
        id: 0,
        deviceToken: undefined,
        profilePicture: '',
        role: Role.ADMIN,
        createdAT: new Date(),
        updatedAT: undefined,
        isVerified: false,
        resetPasswordToken: '',
        resetPasswordTokenExpTime: undefined,
        address: {
          address: '',
          lat: 0,
          lon: 0,
        },
      });

      //save notification
      await this.notificationService.create({
        message: `Welcome ${name}, your account has been created successfully.`,
        subject: 'Admin Account Creation',
        account: (await user).adminID, //saves when the user is created
      });

      return this.responseService.success(
        'admin registered successfully,please check email provided for the otpCode',
        user,
      );
    } catch (error) {
      return this.responseService.internalServerError(
        'Error occured during Signup',
        error.message,
      );
    }
  }
  async verifyOtp(dto: VerifyOtp): Promise<StandardResponse<Admin>> {
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

      const admin = await this.adminRepository.findByEmail(isOtp.email);
      if (!admin)
        return this.responseService.notFound(
          'user associated to otp not found',
        );

      // Update customer using proper update object
      await this.adminRepository.update(admin.id, {
        isVerified: true,
        updatedAT: new Date(),
      });

      // Fetch the updated customer
      const updatedAdmin = await this.adminRepository.findByEmail(
        isOtp.email,
      );

      // Update OTP to mark it as verified
      await this.otpRepository.update(isOtp.id, {
        verified: true,
      });

      

      // Save notification
      await this.notificationService.create({
        message: `Hello ${updatedAdmin.name}, your account has been verified successfully and order Cart created.`,
        subject: 'Email Verification',
        account: updatedAdmin.adminID,
      });

      return this.responseService.success(
        'email verified successfully ',
        updatedAdmin,
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

      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin)
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
        message: `Hi ${admin.name}, otp resent after two minutes.`,
        subject: 'OTP resent After two Minutes',
        account: admin.adminID,
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
      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin)
        return this.responseService.notFound('this email is not found');

      //generate and update otp
      const resetOtp = await this.generatorService.generateEmailToken();

      // Send resetOTP via email
      await this.mailService.ForgotPasswordMail(dto.email, resetOtp);

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);
      admin.resetPasswordToken = resetOtp;
      admin.resetPasswordTokenExpTime = expirationTime;
      await this.adminRepository.save( admin);

      await this.notificationService.create({
        message: `Hi ${admin.name}, password reset otp sent.`,
        subject: 'Password Reset otp sent',
        account: admin.adminID,
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
        await this.adminRepository.findbyPasswordResetToken(dto.otp);
      if (!findresetOtp)
        return this.responseService.notFound(
          'reset password token not a match',
        );

      if (findresetOtp.resetPasswordTokenExpTime <= new Date())
        return this.responseService.badRequest('reset password token expired');

      await this.notificationService.create({
        message: `Hi ${findresetOtp.name}, password reset otp verified.`,
        subject: 'Password Reset otp verified',
        account: findresetOtp.adminID,
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
      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin)
        return this.responseService.badRequest(
          'email not associated with any user',
        );

      if (!admin.isVerified)
        return this.responseService.badRequest('user is not verified yet');
      //hash new password
      const hashpassword = await this.generatorService.hashpassword(
        dto.password,
      );

      admin.password = hashpassword;
      (admin.resetPasswordToken = null),
        (admin.resetPasswordTokenExpTime = null);

      await this.adminRepository.save( admin);

      await this.notificationService.create({
        message: `Hi ${admin.name}, password reset sucessful.`,
        subject: 'Password Reset',
        account: admin.adminID,
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
      const admin = await this.adminRepository.findByEmail(dto.email);
      if (!admin) return this.responseService.notFound('invalid credential');

      const comparePassword = await this.generatorService.comaprePassword(
        dto.password,
        admin.password,
      );
      if (!comparePassword)
        return this.responseService.notFound('invalid credential');

      if (!admin.isVerified)
        return this.responseService.badRequest('user is not verified yet');

      await this.notificationService.create({
        message: `Hi ${admin.name}, logged in successfully.`,
        subject: 'User Login',
        account: admin.adminID,
      });

      // Generate and return JWT token
      const token = await this.generatorService.signToken(
        admin.id,
        admin.email,
        admin.role,
      );

      return this.responseService.success('log in successful', {
        token: token,
        user: admin,
      });
    } catch (error) {
      return this.responseService.internalServerError(
        'Error logging in',
        error.message,
      );
    }
  }
}
