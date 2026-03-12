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
import { SignupDto } from '../dto/signup.dto';
import { RiderAuthService } from '../services/rider.auth.service';
import { Rider } from 'src/Rider/Domain/rider';
import { RoleGuard } from '../Guard/role.guard';
import { Roles } from '../Decorator/role.decorator';
import { Role } from 'src/Enums/users.enum';
import { devicetokenDto } from '../dto/devicetoken.dto';

@ApiTags('Rider Auth')
@Controller({
  path: 'rider/auth/',
  version: '1',
})
@ApiExtraModels(StandardResponse)
export class RiderAuthController {
  constructor(private readonly riderrauthService: RiderAuthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(Role.RIDER)
  @Get('profile')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Rider>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Rider),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch logged in customer profile (guarded)' })
  //@HttpCode(HttpStatus.OK)
  async profile(@Req() req): Promise<StandardResponse<Rider>> {
    return await this.riderrauthService.Profile(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(Role.RIDER)
  @Patch('add-deviceToken')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Rider>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Rider),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'add device token (guarded)' })
  //@HttpCode(HttpStatus.OK)
  async deicetoken(
    @Req() req,
    @Body() dto: devicetokenDto,
  ): Promise<StandardResponse<Rider>> {
    return await this.riderrauthService.deviceToken(req.user, dto);
  }

  @Post('signup-rider')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Rider>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Rider),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Rider signup' })
  async signUpProfessionalPlanner(
    @Body() dto: SignupDto,
  ): Promise<StandardResponse<Rider>> {
    return await this.riderrauthService.singUpRider(dto);
  }

  @Post('verify-otp')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<any>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Rider),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({
    summary: 'verification of the otp sent after rider successfully registers',
  })
  async verifyOtp(@Body() dto: VerifyOtp): Promise<StandardResponse<any>> {
    return await this.riderrauthService.verifyOtp(dto);
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
  async resendOtp(
    @Body() dto: ResendExpiredOtp,
  ): Promise<StandardResponse<boolean>> {
    return await this.riderrauthService.resendOtp(dto);
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
    @Body() dto: RequestPasswordResetOtp,
  ): Promise<StandardResponse<boolean>> {
    return await this.riderrauthService.SendResetPasswordOtp(dto);
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
    @Body() dto: VerifyOtp,
  ): Promise<StandardResponse<boolean>> {
    return await this.riderrauthService.verifyResetPasswordOtp(dto);
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
    return await this.riderrauthService.resetPassword(dto);
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
  @ApiOperation({ summary: 'Login rider' })
  //@HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<StandardResponse<any>> {
    return await this.riderrauthService.Login(dto);
  }
}
