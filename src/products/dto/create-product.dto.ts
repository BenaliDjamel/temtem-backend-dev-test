import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { ParseObjectId } from 'nestjs-object-id';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @MaxLength(255)
  @IsOptional()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @ParseObjectId()
  store: Types.ObjectId;
}
