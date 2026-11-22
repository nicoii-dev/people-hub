"use client";

import type { ReactNode } from "react";
import { PermissionGate } from "@/components/shared/permission-gate";
import { findNavItem } from "@/config/navigation";
import { MockLogin } from "@/features/auth/components/mock-login";
import { useAuth } from "@/features/auth/hooks";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import { useAppSelector } from "@/store";

export function AppShell({ children }: { children: ReactNode }) {
  const { authenticated, user, hydrated } = useAuth();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const pathname = usePathname();
  const current = findNavItem(pathname);

  if (hydrated && (!authenticated || !user)) {
    return <MockLogin />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="scrollbar-thin flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <PermissionGate permission={current?.permission ?? "dashboard:view"}>
              {children}
            </PermissionGate>
          </div>
        </main>
      </div>
      {collapsed ? <span className="sr-only">Sidebar collapsed</span> : null}
    </div>
  );
}
