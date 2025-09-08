import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
