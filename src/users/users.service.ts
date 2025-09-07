import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from './dtos/register-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email });
  }

  async register(userData: RegisterUserDto): Promise<User> {
    const createdUser = new this.userModel(userData);
    await createdUser.save();

    return { email: createdUser.email, roles: createdUser.roles } as User;
  }
}
