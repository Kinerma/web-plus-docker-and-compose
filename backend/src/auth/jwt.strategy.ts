import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const configService = new ConfigService();
    super({
      configService: ConfigService,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'jwt_secret'),
    });
  }
  async validate(jwtPayload: { sub: number }) {
    const user = await this.usersService.findOne({
      where: { id: jwtPayload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
