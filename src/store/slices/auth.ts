import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/config/permissions";
import { mockUsers } from "@/features/auth/mock-auth.service";
import type { AuthSession, MockUser } from "@/features/auth/types";

interface AuthState extends AuthSession {
  hydrated: boolean;
}

const initialState: AuthState = {
  user: mockUsers.hr_admin,
  authenticated: true,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.authenticated = action.payload.authenticated;
      state.hydrated = true;
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.authenticated = action.payload.authenticated;
    },
    setUser(state, action: PayloadAction<MockUser | null>) {
      state.user = action.payload;
      state.authenticated = action.payload !== null;
    },
    switchRole(state, action: PayloadAction<Role>) {
      state.user = mockUsers[action.payload];
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
