import { env } from "@/config/env";

export const MOCK_COLLECTIONS = {
  employees: "employees",
  departments: "departments",
  positions: "positions",
  attendance: "attendance",
  leaves: "leaves",
  leaveBalances: "leave-balances",
  payrollPeriods: "payroll-periods",
  payrollRecords: "payroll-records",
  jobs: "jobs",
  candidates: "candidates",
  applications: "applications",
  interviews: "interviews",
  reviews: "reviews",
  goals: "goals",
  notifications: "notifications",
  users: "users",
} as const;

export type MockCollection =
  (typeof MOCK_COLLECTIONS)[keyof typeof MOCK_COLLECTIONS];

export const MOCK_VALUES = {
  session: "session",
  ui: "ui",
  companyProfile: "company-profile",
} as const;

export type MockValue = (typeof MOCK_VALUES)[keyof typeof MOCK_VALUES];

function storageKey(key: string) {
  return `${env.storagePrefix}:${key}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readCollection<T>(collection: MockCollection, seed: T[]): T[] {
  if (!canUseStorage()) return clone(seed);

  const raw = window.localStorage.getItem(storageKey(collection));
  if (!raw) return clone(seed);

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : clone(seed);
  } catch {
    return clone(seed);
  }
}

export function writeCollection<T>(collection: MockCollection, value: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey(collection), JSON.stringify(value));
}

export function readValue<T>(key: MockValue, seed: T): T {
  if (!canUseStorage()) return clone(seed);

  const raw = window.localStorage.getItem(storageKey(key));
  if (!raw) return clone(seed);

  try {
    return JSON.parse(raw) as T;
  } catch {
    return clone(seed);
  }
}

export function writeValue<T>(key: MockValue, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey(key), JSON.stringify(value));
}

export function resetMockData() {
  if (!canUseStorage()) return;
  Object.values(MOCK_COLLECTIONS).forEach((collection) => {
    window.localStorage.removeItem(storageKey(collection));
  });
  Object.values(MOCK_VALUES).forEach((key) => {
    window.localStorage.removeItem(storageKey(key));
  });
}

export function mockDelay(ms = 120) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
