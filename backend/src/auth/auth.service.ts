import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './local-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  async signin(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.userPassword(username);
    const isPassword = await bcrypt.compare(password, user.password);
    if (user && isPassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
