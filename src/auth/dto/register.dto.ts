import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SYSTEM_ROLES } from 'src/common/constants/roles.constants';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsEnum(SYSTEM_ROLES)
  @IsOptional()
  role: string;

  @MaxLength(15)
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
