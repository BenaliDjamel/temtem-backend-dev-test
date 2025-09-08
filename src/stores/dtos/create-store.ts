import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(3)
  readonly name: string;

  @MaxLength(255)
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsNotEmpty()
  readonly category: string;
}
