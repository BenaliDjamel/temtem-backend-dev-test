export class PaginationResultDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(partial: Partial<PaginationResultDto<T>>) {
    Object.assign(this, partial);
  }
}
