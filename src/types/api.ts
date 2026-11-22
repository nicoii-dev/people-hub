export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export interface Paginated<T> {
  items: T[];
  meta: ApiMeta;
}

export type ServiceResult<T> = Promise<ApiSuccess<T>>;
