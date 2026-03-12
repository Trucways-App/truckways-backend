import {
    Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { StandardResponse } from 'src/utils/services/response.service';
import { JwtGuard } from '../Guard/jwt.guard';
import { VerifyOtp } from '../dto/verify-otp.dto';
import { ResendExpiredOtp } from '../dto/resend-expired-otp.dto';
import { RequestPasswordResetOtp } from '../dto/password-reset-dto';
import { ResetPasswordDto } from '../dto/reset-password-otp.dto';
import { LoginDto } from '../dto/login.dto';
import { CustomerAuthService } from '../services/customer.auth.service';
import { Customer } from 'src/Customer/Domain/customer';
import { SignupDto } from '../dto/signup.dto';
import { RoleGuard } from '../Guard/role.guard';
import { Roles } from '../Decorator/role.decorator';
import { Role } from 'src/Enums/users.enum';
import { devicetokenDto } from '../dto/devicetoken.dto';


@ApiTags('Customer Auth')
@Controller({
  path: 'customer/auth/',
  version: '1',
})
@ApiExtraModels(StandardResponse)
export class CustomerAuthController {
  constructor(private readonly customerauthService: CustomerAuthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.CUSTOMER)
  @Get('profile')
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
  @ApiOperation({ summary: 'fetch logged in customer profile (guarded)' })
  //@HttpCode(HttpStatus.OK)
  async profile(@Req() req): Promise<StandardResponse<Customer>> {
    return await this.customerauthService.Profile(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.CUSTOMER)
  @Patch('add-deviceToken')
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
  @ApiOperation({ summary: 'add device token (guarded)' })
  //@HttpCode(HttpStatus.OK)
  async deicetoken(@Req() req, @Body()dto:devicetokenDto): Promise<StandardResponse<Customer>> {
    return await this.customerauthService.deviceToken(req.user,dto);
  }

  @Post('signup-customer')
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
  @ApiOperation({ summary: 'Customer signup' })
  async signUpProfessionalPlanner(@Body()dto: SignupDto): Promise<StandardResponse<Customer>> {
    return await this.customerauthService.singUpCustomer(dto);
  }

 

  @Post('verify-otp')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<any>) },
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
  @ApiOperation({ summary: 'verification of the otp sent after customer successfully registers' })
  async verifyOtp(@Body()dto: VerifyOtp): Promise<StandardResponse<any>> {
    return await this.customerauthService.verifyOtp(dto);
  }

  @Post('resend-otp')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<boolean>) },
        {
          properties: {
            payload: {},
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'otp resent after initial one sent had expired' })
  //@HttpCode(HttpStatus.OK)
  async resendOtp(@Body()dto: ResendExpiredOtp): Promise<StandardResponse<boolean>> {
    return await this.customerauthService.resendOtp(dto);
  }

  @Post('forgot-password')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<boolean>) },
        {
          properties: {
            payload: {},
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'request for reset password otp' })
  //@HttpCode(HttpStatus.OK)
  async SendResetPasswordOtp(
    @Body()dto: RequestPasswordResetOtp,
  ): Promise<StandardResponse<boolean>> {
    return await this.customerauthService.SendResetPasswordOtp(dto);
  }

  @Post('verify-reset-password-otp')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<boolean>) },
        {
          properties: {
            payload: {},
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'verify reset password otp sent' })
 // @HttpCode(HttpStatus.OK)
  async verifyResetPasswordOtp(
    @Body()dto: VerifyOtp,
  ): Promise<StandardResponse<boolean>> {
    return await this.customerauthService.verifyResetPasswordOtp(dto);
  }

  @Patch('reset-password')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<boolean>) },
        {
          properties: {
            payload: {},
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'finally reset password' })
  //@HttpCode(HttpStatus.OK)
  async resetPassword(
   @Body() dto: ResetPasswordDto,
  ): Promise<StandardResponse<boolean>> {
    return await this.customerauthService.resetPassword(dto);
  }

  @Post('login')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<any>) },
        {
          properties: {
            payload: {},
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Login customer' })
  //@HttpCode(HttpStatus.OK)
  async login(@Body()dto: LoginDto): Promise<StandardResponse<any>> {
    return await this.customerauthService.Login(dto)
  }
}
