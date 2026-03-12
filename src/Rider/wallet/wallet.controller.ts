import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Roles } from 'src/Auth/Decorator/role.decorator';
import { JwtGuard } from 'src/Auth/Guard/jwt.guard';
import { RoleGuard } from 'src/Auth/Guard/role.guard';
import { Role } from 'src/Enums/users.enum';
import { WalletService } from './wallet.service';
import { CashoutDto, FinalizeWithdrawalDto } from './dto/cashout.dto';
import { Transactions } from 'src/Rider/Domain/transaction';
import { StandardResponse } from 'src/utils/services/response.service';
import { Wallet } from '../Domain/wallet';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtGuard,RoleGuard)
@Roles(Role.RIDER)
@Controller({
  path: 'wallet/',
})
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  
  @Post('initialize-cashout')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<Transactions>) },
        {
          properties: {
            payload: {
              $ref: getSchemaPath(Transactions),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'initialize funds cashout from wallet for the rider' })
  async cashoutFunds(
    @Req() req,
    @Body() dto: CashoutDto,
  ): Promise<StandardResponse<Transactions>> {
    return await this.walletService.cashout(req.user, dto);
  }

  @Post('finalizeWithdrawl')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(StandardResponse<any>) },
        {
          properties: {
            payload: {
              //$ref: getSchemaPath(Wallet),
            },
          },
        },
      ],
    },
  })
  @ApiOperation({
    summary:
      ' finalize the withdrawal by inputing the otp and the transfer code',
  })
  async finalizeWithdrawal(
    @Req() req,
    @Body() dto: FinalizeWithdrawalDto,
  ): Promise<StandardResponse<any>> {
    return await this.walletService.finalizeWithdrawal(dto);
  }
}
