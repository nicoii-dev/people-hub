"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BellRing,
  Building2,
  CheckCircle2,
  Database,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useDepartments, usePositions } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import { useNotifications } from "@/hooks/use-notifications";
import { env } from "@/config/env";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/config/permissions";
import { useAuth } from "@/features/auth/hooks";
import { resetMockData } from "@/services/mock/persistence";

const architectureLayers = [
  { label: "UI components", detail: "Consume hooks, never mock data directly" },
  { label: "TanStack Query hooks", detail: "Loading, caching, mutations, invalidation" },
  { label: "Service interfaces", detail: "Mock or API implementation selected by env" },
  { label: "Mock persistence", detail: "Versioned localStorage, isolated from backend code" },
];

export function FoundationOverview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const employees = useEmployees({ limit: 1 });
  const departments = useDepartments();
  const positions = usePositions();
  const notifications = useNotifications();

  const employeeTotal = employees.data?.data.meta.total ?? 0;
  const departmentTotal = departments.data?.data.meta.total ?? 0;
  const positionTotal = positions.data?.data.meta.total ?? 0;
  const unreadTotal = (notifications.data?.data ?? []).filter((item) => !item.read).length;
  const isLoading = employees.isPending || departments.isPending || positions.isPending || notifications.isPending;

  function handleReset() {
    resetMockData();
    queryClient.clear();
    toast.success("Mock data reset. Reloading…");
    window.setTimeout(() => window.location.reload(), 350);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foundation workspace"
        description="Phase 1 is complete: design system, application shell, mock auth, service layer, and persisted mock data are ready."
        actions={
          <>
            <Badge variant={env.useMockData ? "success" : "default"} className="gap-1.5 py-1">
              <span className="size-1.5 rounded-full bg-current" />
              {env.useMockData ? "Mock data mode" : "API mode"}
            </Badge>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4" />
              Reset mock data
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Mock employees" value={employeeTotal} icon={UsersRound} loading={isLoading} description="Seeded from src/data/employees.ts" />
        <StatCard title="Departments" value={departmentTotal} icon={Building2} loading={isLoading} description="Linked to employees and positions" />
        <StatCard title="Positions" value={positionTotal} icon={Layers3} loading={isLoading} description="Department-aware job titles" />
        <StatCard title="Unread notices" value={unreadTotal} icon={BellRing} loading={isLoading} description="Persisted notification read state" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              Backend-ready architecture
            </CardTitle>
            <CardDescription>
              The UI is insulated from data sources. Switching <code className="rounded bg-muted px-1">NEXT_PUBLIC_USE_MOCK_DATA</code> to false routes every service through the API client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {architectureLayers.map((layer, index) => (
              <div key={layer.label} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{layer.label}</p>
                  <p className="text-xs text-muted-foreground">{layer.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Active role
            </CardTitle>
            <CardDescription>Mock session with permission-based navigation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{user ? ROLE_LABELS[user.role] : "No session"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "Sign in from the profile menu"}</p>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {user ? ROLE_PERMISSIONS[user.role].length : 0} permissions granted
              </p>
              <div className="scrollbar-thin flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                {(user ? ROLE_PERMISSIONS[user.role] : []).map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-[10px]">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            What is working in Phase 1
          </CardTitle>
          <CardDescription>Every item below is interactive in this build.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Collapsible desktop sidebar and mobile navigation sheet",
              "Global search across seeded employees and departments",
              "Notification dropdown with persistent read state",
              "Light/dark theme toggle with flash-free bootstrap",
              "Mock login, logout, and five-role switching",
              "TanStack Query hooks with loading and error states",
              "LocalStorage mock persistence with reset control",
              "Zod-ready form dialogs and confirmation dialogs",
              "Reusable design-system components in src/components/ui",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpRight className="size-4" />
            Phase 2 will replace this overview with the operational dashboard and core HR modules.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
