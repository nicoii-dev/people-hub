import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/config/permissions";
import { mockUsers } from "@/features/auth/mock-auth.service";
import { normalizeSession, normalizeUser } from "@/features/auth/session";
import type { AuthSession, MockUser } from "@/features/auth/types";

interface AuthState extends AuthSession {
  hydrated: boolean;
}

// Keep the pre-hydration state empty so a refresh never renders another
// role's navigation before the persisted session is restored.
const initialState: AuthState = {
  user: null,
  authenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<AuthSession>) {
      const session = normalizeSession(action.payload);
      state.user = session.user;
      state.authenticated = session.authenticated;
      state.hydrated = true;
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      const session = normalizeSession(action.payload);
      state.user = session.user;
      state.authenticated = session.authenticated;
    },
    setUser(state, action: PayloadAction<MockUser | null>) {
      const user = normalizeUser(action.payload);
      state.user = user;
      state.authenticated = user !== null;
    },
    switchRole(state, action: PayloadAction<Role>) {
      state.user = normalizeUser(mockUsers[action.payload]);
      state.authenticated = true;
    },
    logout(state) {
      state.user = null;
      state.authenticated = false;
    },
  },
});

export const { hydrateAuth, logout, setSession, setUser, switchRole } = authSlice.actions;
export default authSlice.reducer;
