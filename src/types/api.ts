export type ApiResult = "SUCCESS" | "ERROR";

export type ApiEnvelope<T> = {
  result: ApiResult;
  data: T;
  error?: { message?: string } | string | null;
  meta?: {
    timestamp?: string;
    requestId?: string;
    durationMs?: number;
  };
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
