import type { ApiMeta, ApiSuccess, ListParams, Paginated } from "@/types/api";
import { success } from "./result";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function getField(item: object, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

export function paginate<T extends object>(
  items: T[],
  params: ListParams,
  message: string,
): ApiSuccess<Paginated<T>> {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.max(1, Number(params.limit ?? 10));
  const search = readString(params.search).trim().toLowerCase();
  const sort = readString(params.sort);
  const order = params.order === "desc" ? -1 : 1;

  let filtered = items;

  if (search) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "string" && value.toLowerCase().includes(search),
      ),
    );
  }

  if (sort) {
    filtered = [...filtered].sort((a, b) => compare(getField(a, sort), getField(b, sort)) * order);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  const meta: ApiMeta = { page: safePage, limit, total, totalPages };

  return success(
    { items: filtered.slice(start, start + limit), meta },
    message,
  );
}
