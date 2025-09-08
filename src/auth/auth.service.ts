import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInUserDto } from './dto/signIn.dto';
import { RegisterUserDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { SALT_OR_ROUNDS } from './constants/constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async signIn(userData: SignInUserDto): Promise<any> {
    const user = await this.usersService.findOne(userData.email);
    if (!user) throw new NotFoundException('User does not exist');

    const isMatch = await bcrypt.compare(userData.password, user.password);
    if (!isMatch) throw new NotFoundException('User does not exist');

    const payload = { id: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(userData: RegisterUserDto): Promise<any> {
    const user = await this.usersService.findOne(userData.email);
    if (user) throw new BadRequestException('Email already exist');

    const hashedPassword = await bcrypt.hash(userData.password, SALT_OR_ROUNDS);

    await this.usersService.register({
      email: userData.email,
      role: userData.role,
      password: hashedPassword,
    });

    return {
      email: userData.email,
      message: 'User registered successfully',
    };
  }
}
