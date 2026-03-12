import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminRepository } from 'src/Admin/Infrastructure/Persistence/admin-repository';
import { CustomerRepository } from 'src/Customer/Infrastructure/Persistence/customer-repository';
import { RiderRepository } from 'src/Rider/Infrastructure/Persistence/rider-repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configservice: ConfigService,
    private readonly customerRepo: CustomerRepository,
    private readonly riderRepo: RiderRepository,
    private readonly adminRepo:AdminRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configservice.get('AUTH_JWT_SECRET'),
    });
  }

  async ValidateUserOrAdminOrRiderByIdandRole(id:number, role:string){
    switch(role){
        case "Rider":
            return await this.riderRepo.findByID(id)
        case "Customer":
            return await this.customerRepo.findByID(id)
        case "Admin":
           return await this.adminRepo.findByID(id)
       

        default:
            return null
    }
}

  async validate(payload: any) {
    const { sub: id, email, role } = payload;

    const user = await this.ValidateUserOrAdminOrRiderByIdandRole(
      id,
      role,
    );

    if (!user) throw new UnauthorizedException('invalid token');

    user.role = role;
    user.email = email;

    return user;
  }
}
