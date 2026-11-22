"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { authService } from "@/features/auth/mock-auth.service";
import { MOCK_VALUES, readValue } from "@/services/mock/persistence";
import { store, useAppDispatch, useAppSelector } from "@/store";
import { hydrateAuth } from "@/store/slices/auth";
import { hydrateUi, type UiState } from "@/store/slices/ui";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  return browserQueryClient;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  React.useEffect(() => {
    let active = true;

    void authService.getSession().then((session) => {
      if (active) dispatch(hydrateAuth(session));
    });

    const storedUi = readValue<Pick<UiState, "sidebarCollapsed" | "theme">>(
      MOCK_VALUES.ui,
      { sidebarCollapsed: false, theme: "light" },
    );
    dispatch(hydrateUi(storedUi));

    return () => {
      active = false;
    };
  }, [dispatch]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("people-hub:theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <TooltipProvider delayDuration={200}>
        <Toaster position="top-right" richColors closeButton />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AppProviders>{children}</AppProviders>
    </ReduxProvider>
  );
}
