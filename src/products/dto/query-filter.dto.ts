import { Type } from 'class-transformer';
import { Order } from '../../common/constants/order.constants';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryFilterDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(Order)
  @IsOptional()
  order?: Order;

  @IsString()
  @IsOptional()
  orderBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
