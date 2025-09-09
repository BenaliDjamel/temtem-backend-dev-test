import { ApiProperty } from '@nestjs/swagger';

export class PaginationResultDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  constructor(partial: Partial<PaginationResultDto<T>>) {
    Object.assign(this, partial);
  }
}
