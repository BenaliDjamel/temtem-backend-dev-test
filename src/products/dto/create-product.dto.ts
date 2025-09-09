import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ParseObjectId } from 'nestjs-object-id';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @MaxLength(255)
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ example: 99.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  image?: string;

  @ApiProperty({ type: String, description: 'Store ObjectId' })
  @ParseObjectId()
  store: Types.ObjectId;
}
