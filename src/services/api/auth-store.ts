/**
 * Client-side storage for the NestJS auth session.
 *
 * Tokens are kept in localStorage so a page refresh can restore the session.
 * The company id is sent as `X-Company-Id` on every tenant-scoped request.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  tokenType: "Bearer";
  accessTokenExpiresIn: string;
}

interface AuthState {
  tokens: AuthTokens | null;
  companyId: string | null;
}

const STORAGE_KEY = "people-hub:auth:v1";

const emptyState: AuthState = { tokens: null, companyId: null };

let state: AuthState | null = null;

function readState(): AuthState {
  if (state) return state;

  state = { ...emptyState };
  if (typeof window === "undefined") return state;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      state = {
        tokens: parsed.tokens ?? null,
        companyId: parsed.companyId ?? null,
      };
    }
  } catch {
    state = { ...emptyState };
  }

  return state;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readState()));
  } catch {
    // Storage can be unavailable (private mode, quota). Keep the in-memory session.
  }
}

export function getTokens(): AuthTokens | null {
  return readState().tokens;
}

export function setTokens(tokens: AuthTokens | null): void {
  readState().tokens = tokens;
  persist();
}

export function getCompanyId(): string | null {
  return readState().companyId;
}

export function setStoredCompanyId(companyId: string | null): void {
  readState().companyId = companyId;
  persist();
}

export function clearAuth(): void {
  state = { ...emptyState };
  persist();
}
