"use client";

import { useEffect, type ReactNode } from "react";
import { PermissionGate } from "@/components/shared/permission-gate";
import { findNavItem } from "@/config/navigation";
import { MockLogin } from "@/features/auth/components/mock-login";
import { useAuth } from "@/features/auth/hooks";
import { TrialBanner } from "@/features/trial/components/trial-banner";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import { useAppSelector } from "@/store";

export function AppShell({ children }: { children: ReactNode }) {
  const { authenticated, user, hydrated } = useAuth();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const pathname = usePathname();
  const router = useRouter();
  const current = findNavItem(pathname);

  // Keep each role inside its own area: employees in self-service, super
  // admins in the platform control plane, and everyone else in the HR workspace.
  useEffect(() => {
    if (!hydrated || !authenticated || !user) return;

    if (user.role === "employee" && !pathname.startsWith("/employee")) {
      router.replace("/employee/dashboard");
      return;
    }

    if (user.role === "super_admin" && !pathname.startsWith("/platform")) {
      router.replace("/platform");
      return;
    }

    if (user.role !== "super_admin" && pathname.startsWith("/platform")) {
      router.replace("/dashboard");
    }
  }, [authenticated, hydrated, pathname, router, user]);

  // Wait for the stored session before rendering any role-based UI.
  if (!hydrated) return null;

  if (!authenticated || !user) {
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
            <TrialBanner />
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
