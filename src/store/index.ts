import { useSyncExternalStore } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { MOCK_VALUES, writeValue } from "@/services/mock/persistence";
import authReducer from "./slices/auth";
import uiReducer from "./slices/ui";

const reducer = {
  auth: authReducer,
  ui: uiReducer,
};

export const store = configureStore({ reducer });

// This store is never mutated. React uses it as the snapshot during SSR and
// hydration, so persisted client state cannot alter the first client render.
const serverStore = configureStore({ reducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

function subscribeToStore(onStoreChange: () => void) {
  return store.subscribe(onStoreChange);
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSyncExternalStore(
    subscribeToStore,
    () => selector(store.getState()),
    () => selector(serverStore.getState()),
  );
}

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
