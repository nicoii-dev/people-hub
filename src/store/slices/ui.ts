import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

export interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: Theme;
  hydrated: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: "light",
  hydrated: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    hydrateUi(
      state,
      action: PayloadAction<Pick<UiState, "sidebarCollapsed" | "theme">>,
    ) {
      state.sidebarCollapsed = action.payload.sidebarCollapsed;
      state.theme = action.payload.theme;
      state.hydrated = true;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
  },
});

export const {
  hydrateUi,
  setMobileSidebarOpen,
  setTheme,
  toggleSidebar,
  toggleTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
