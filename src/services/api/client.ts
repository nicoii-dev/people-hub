import { env } from "@/config/env";
import type { ApiResponse, ApiSuccess, ListParams } from "@/types/api";

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

export function buildQuery(params: ListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiSuccess<T>> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError(
      "The server returned an invalid response.",
      response.status,
      null,
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      payload.success ? "Request failed" : payload.message,
      response.status,
      payload as ApiResponse<unknown>,
    );
  }

  return payload as ApiSuccess<T>;
}

export const apiClient = {
  get: <T>(path: string, params?: ListParams) =>
    apiRequest<T>(`${path}${buildQuery(params)}`),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
