import type { ApiFailure, ApiSuccess } from "@/types/api";

export function success<T>(data: T, message: string): ApiSuccess<T> {
  return { success: true, message, data };
}

export function failure(message: string, code?: string): ApiFailure {
  return { success: false, message, code };
}

export function assertFound<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`${label} not found`);
  }
  return value;
}
