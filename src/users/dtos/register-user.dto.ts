import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SYSTEM_ROLES } from '../../common/constants/roles.constants';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional({ enum: SYSTEM_ROLES })
  @IsEnum(SYSTEM_ROLES)
  @IsOptional()
  readonly role: string;

  @ApiProperty({ minLength: 6, maxLength: 15 })
  @MaxLength(15)
  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;
}
