import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { MOCK_VALUES, writeValue } from "@/services/mock/persistence";
import authReducer from "./slices/auth";
import uiReducer from "./slices/ui";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    if (!state.auth.hydrated || !state.ui.hydrated) return;

    writeValue(MOCK_VALUES.session, {
      user: state.auth.user,
      authenticated: state.auth.authenticated,
    });
    writeValue(MOCK_VALUES.ui, {
      sidebarCollapsed: state.ui.sidebarCollapsed,
      theme: state.ui.theme,
    });
  });
}
