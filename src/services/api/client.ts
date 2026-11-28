import { env } from "@/config/env";
import type {
  ApiFailure,
  ApiResponse,
  ApiSuccess,
  ListParams,
} from "@/types/api";
import {
  clearAuth,
  getCompanyId,
  getTokens,
  setTokens,
  type AuthTokens,
} from "./auth-store";

interface ApiFieldError {
  field?: string;
  message: string;
  code?: string;
}

interface BackendPayload<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: ApiSuccess<unknown>["meta"];
  errors?: ApiFieldError[] | Record<string, string[]>;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly response: ApiResponse<unknown> | null;

  constructor(message: string, status: number, response: ApiResponse<unknown> | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.response = response;
  }
}

/** The frontend uses `sort`/`order`; the NestJS PaginationDto uses `sortBy`/`sortOrder`. */
const QUERY_ALIASES: Record<string, string> = {
  sort: "sortBy",
  order: "sortOrder",
};

export function buildQuery(params: ListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return;
    searchParams.set(QUERY_ALIASES[key] ?? key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function requestHeaders(init: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const tokens = getTokens();
  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const companyId = getCompanyId();
  if (companyId) {
    headers["X-Company-Id"] = companyId;
  }

  return headers;
}

function normalizeErrors(
  errors: BackendPayload<unknown>["errors"],
): Record<string, string[]> | undefined {
  if (!errors) return undefined;
  if (!Array.isArray(errors)) return errors;

  const grouped: Record<string, string[]> = {};
  errors.forEach(({ field, message }) => {
    const key = field || "form";
    (grouped[key] ??= []).push(message);
  });
  return grouped;
}

function failurePayload(payload: BackendPayload<unknown>): ApiFailure {
  return {
    success: false,
    message: payload.message ?? "Request failed",
    ...(payload.errors ? { errors: normalizeErrors(payload.errors) } : {}),
  };
}

let inflightRefresh: Promise<boolean> | null = null;

function doRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return Promise.resolve(false);

  return fetch(`${env.apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const payload = (await response.json()) as BackendPayload<AuthTokens>;
      if (!payload.success || !payload.data?.accessToken) return false;
      setTokens(payload.data);
      return true;
    })
    .catch(() => false);
}

function refreshAccessToken(): Promise<boolean> {
  inflightRefresh ??= doRefresh().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}

function canRefresh(path: string) {
  return !path.startsWith("/auth/login")
    && !path.startsWith("/auth/register")
    && !path.startsWith("/auth/refresh")
    && !path.startsWith("/auth/forgot-password")
    && !path.startsWith("/auth/reset-password")
    && !path.startsWith("/auth/verify-email");
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<ApiSuccess<T>> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: requestHeaders(init),
  });

  if (response.status === 401 && !isRetry && canRefresh(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiRequest<T>(path, init, true);
    clearAuth();
  }

  let payload: BackendPayload<T>;
  try {
    payload = (await response.json()) as BackendPayload<T>;
  } catch {
    throw new ApiRequestError(
      "The server returned an invalid response.",
      response.status,
      null,
    );
  }

  if (!response.ok || payload.success === false) {
    throw new ApiRequestError(
      payload.message ?? "Request failed",
      response.status,
      failurePayload(payload),
    );
  }

  // The API returns paginated collections as `{ data: [...], meta }`.
  // The frontend services consume `{ data: { items, meta } }`.
  const data =
    payload.meta && Array.isArray(payload.data)
      ? { items: payload.data, meta: payload.meta }
      : payload.data;

  return {
    success: true,
    message: payload.message ?? "Success",
    data: data as T,
    ...(payload.meta ? { meta: payload.meta } : {}),
  };
}

export interface ApiDownload {
  content: string;
  fileName: string | null;
}

function downloadFileName(header: string | null): string | null {
  return header?.match(/filename="([^"]+)"/)?.[1] ?? null;
}

/** File endpoints bypass the JSON envelope; return text and the server filename. */
export async function apiDownload(
  path: string,
  params?: ListParams,
  isRetry = false,
): Promise<ApiDownload> {
  const url = `${env.apiUrl}${path}${buildQuery(params)}`;
  const response = await fetch(url, {
    headers: requestHeaders({ headers: { Accept: "text/csv" } }),
  });

  if (response.status === 401 && !isRetry && canRefresh(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiDownload(path, params, true);
    clearAuth();
  }

  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const payload = (await response.json()) as BackendPayload<unknown>;
      message = payload.message ?? message;
    } catch {
      // Non-JSON proxy errors still surface the status code.
    }
    throw new ApiRequestError(message, response.status, null);
  }

  return {
    content: await response.text(),
    fileName: downloadFileName(response.headers.get("content-disposition")),
  };
}

export const apiClient = {
  get: <T>(path: string, params?: ListParams) =>
    apiRequest<T>(`${path}${buildQuery(params)}`),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "PATCH",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  download: (path: string, params?: ListParams) => apiDownload(path, params),
};
