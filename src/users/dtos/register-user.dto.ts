import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  readonly email: string;

  @MaxLength(15)
  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;
}
