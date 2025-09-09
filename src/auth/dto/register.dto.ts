import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SYSTEM_ROLES } from 'src/common/constants/roles.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: SYSTEM_ROLES })
  @IsEnum(SYSTEM_ROLES)
  @IsOptional()
  role: string;

  @ApiProperty({ minLength: 6, maxLength: 15 })
  @MaxLength(15)
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
