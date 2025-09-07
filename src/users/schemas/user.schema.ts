import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SYSTEM_ROLES } from '../../common/constants/roles.constants';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [SYSTEM_ROLES.GUEST], enum: SYSTEM_ROLES })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
