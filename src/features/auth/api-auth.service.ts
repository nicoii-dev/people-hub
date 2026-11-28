import {
  activeCompanyId,
  asRecord,
  toAuthSession,
} from "@/services/api/adapters";
import {
  clearAuth,
  getTokens,
  setStoredCompanyId,
  setTokens,
  type AuthTokens,
} from "@/services/api/auth-store";
import { ApiRequestError, apiRequest } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  MOCK_VALUES,
  writeValue,
} from "@/services/mock/persistence";
import { trialService } from "@/services/trial.service";
import type { TrialState } from "@/types/trial";
import type { AuthService, AuthSession } from "./types";

const emptySession: AuthSession = { user: null, authenticated: false };

async function fetchSession(): Promise<AuthSession> {
  try {
    const response = await apiRequest<Record<string, unknown>>(
      API_ENDPOINTS.auth.me,
    );
    const companyId = activeCompanyId(response.data);
    if (companyId) setStoredCompanyId(companyId);
    return toAuthSession(response.data);
  } catch (error) {
    if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
      clearAuth();
      return emptySession;
    }
    throw error;
  }
}

interface LoginPayload {
  tokens?: AuthTokens;
}

export const apiAuthService: AuthService = {
  async getSession() {
    if (!getTokens()) return emptySession;
    return fetchSession();
  },

  async loginWithCredentials(email: string, password: string) {
    const response = await apiRequest<LoginPayload>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!response.data.tokens) {
      throw new ApiRequestError(
        "The API did not return an access token.",
        500,
        null,
      );
    }
    setTokens(response.data.tokens);
    return fetchSession();
  },

  async login() {
    throw new ApiRequestError(
      "Role-only sign-in is a mock feature. Use email and password with the API.",
      400,
      null,
    );
  },

  async logout() {
    const refreshToken = getTokens()?.refreshToken;
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, {
        method: "POST",
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      });
    } finally {
      clearAuth();
    }
    return emptySession;
  },

  async switchRole() {
    throw new ApiRequestError(
      "Role switching is a mock feature. The API switches companies instead.",
      400,
      null,
    );
  },

  async registerCompany(input) {
    const response = await apiRequest<{
      tokens?: AuthTokens;
      company: { id: string; name: string; slug: string };
      trial: Omit<TrialState, "companyId" | "companyName" | "slug" | "checklist" | "ownerName" | "ownerEmail">;
    }>(API_ENDPOINTS.auth.registerCompany, {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!response.data.tokens) {
      throw new ApiRequestError(
        "The API did not return an access token.",
        500,
        null,
      );
    }
    setTokens(response.data.tokens);
    setStoredCompanyId(response.data.company.id);

    const trial: TrialState = {
      ...response.data.trial,
      companyId: response.data.company.id,
      companyName: response.data.company.name,
      slug: response.data.company.slug,
      ownerName: `${input.firstName} ${input.lastName}`.trim(),
      ownerEmail: input.email,
      checklist: trialService.getChecklist(),
    };
    writeValue(MOCK_VALUES.trial, trial);
    return { session: await fetchSession(), trial };
  },
};

export function companyFromMe(value: unknown): string | null {
  return activeCompanyId(asRecord(value));
}
