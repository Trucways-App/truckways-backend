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
import { SignupDto } from '../dto/signup.dto';
import { RoleGuard } from '../Guard/role.guard';
import { Roles } from '../Decorator/role.decorator';
import { Role } from 'src/Enums/users.enum';
import { AdminAuthService } from '../services/admin.auth.service';
import { Admin } from 'src/Admin/Domain/admin';



@ApiTags('Admin Auth')
@Controller({
  path: 'admin/auth/',
  version: '1',
})
@ApiExtraModels(StandardResponse)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard,RoleGuard)
  @Roles(Role.ADMIN)
  @Get('profile')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Admin>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Admin),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'fetch logged in admin profile (guarded)' })
  //@HttpCode(HttpStatus.OK)
  async profile(@Req() req): Promise<StandardResponse<Admin>> {
    return await this.adminAuthService.Profile(req.user);
  }

  @Post('signup-admin')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Admin>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Admin),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Admin signup' })
  async signUpProfessionalPlanner(@Body()dto: SignupDto): Promise<StandardResponse<Admin>> {
    return await this.adminAuthService.singUpAdmin(dto);
  }

 

  @Post('verify-otp')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Admin>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Admin),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'verification of the otp sent after admin successfully registers' })
  async verifyOtp(@Body()dto: VerifyOtp): Promise<StandardResponse<Admin>> {
    return await this.adminAuthService.verifyOtp(dto);
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
    return await this.adminAuthService.resendOtp(dto);
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
    return await this.adminAuthService.SendResetPasswordOtp(dto);
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
    return await this.adminAuthService.verifyResetPasswordOtp(dto);
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
    return await this.adminAuthService.resetPassword(dto);
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
  @ApiOperation({ summary: 'Login admin' })
  //@HttpCode(HttpStatus.OK)
  async login(@Body()dto: LoginDto): Promise<StandardResponse<any>> {
    return await this.adminAuthService.Login(dto)
  }
}
