import { HydratedDocument } from 'mongoose';
import { SYSTEM_ROLES } from '../role.constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [SYSTEM_ROLES.GUEST] })
  roles: SYSTEM_ROLES[];
}

export const UserSchema = SchemaFactory.createForClass(User);
