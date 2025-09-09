import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  readonly name: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @MaxLength(255)
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly category: string;
}
