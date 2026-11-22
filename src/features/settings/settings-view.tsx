"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, RotateCcw, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/config/permissions";
import { useAuth, usePermission } from "@/features/auth/hooks";
import { useCompanyProfile, useSystemUsers } from "@/hooks/use-settings";
import { resetMockData } from "@/services/mock/persistence";

export function SettingsView() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canManage = usePermission("settings:manage");
  const companyQuery = useCompanyProfile();
  const usersQuery = useSystemUsers();

  if (companyQuery.isError || usersQuery.isError) {
    return (
      <ErrorState
        title="Settings unavailable"
        description="Settings data could not be loaded."
        error={companyQuery.error ?? usersQuery.error}
        onRetry={() => {
          void companyQuery.refetch();
          void usersQuery.refetch();
        }}
      />
    );
  }

  if (companyQuery.isPending || usersQuery.isPending || !companyQuery.data || !usersQuery.data) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  const profile = companyQuery.data.data;
  const users = usersQuery.data.data;
  const role = user?.role;
  const permissions = role ? ROLE_PERMISSIONS[role] : [];

  function handleReset() {
    resetMockData();
    void queryClient.invalidateQueries();
    toast.success("Mock data reset to defaults");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Company profile
          </CardTitle>
          <CardDescription>Organization details used across the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">{profile.companyName}</p>
            <p className="text-sm text-muted-foreground">{profile.legalName}</p>
          </div>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Industry</dt>
              <dd className="text-right font-medium">{profile.industry}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate text-right font-medium">{profile.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="text-right font-medium">
                {profile.city}, {profile.country}
              </dd>
            </div>
          </dl>
          <Button asChild>
            <Link href="/settings/company">Edit company profile</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="size-4 text-primary" />
            Users &amp; roles
          </CardTitle>
          <CardDescription>Workspace access and role assignments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-2xl font-semibold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-2xl font-semibold">
                {users.filter((user) => user.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground">Active users</p>
            </div>
          </div>
          {canManage ? (
            <Button asChild>
              <Link href="/settings/users">Manage users &amp; roles</Link>
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Your role can view settings but cannot manage access.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Current access
          </CardTitle>
          <CardDescription>Previewing the workspace as:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-semibold">{role ? ROLE_LABELS[role] : "Not signed in"}</p>
          <p className="text-sm text-muted-foreground">
            {permissions.length} permission{permissions.length === 1 ? "" : "s"} granted to this role.
          </p>
          <p className="text-xs text-muted-foreground">
            Use the role switcher in the header to preview another role.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="size-4 text-primary" />
            Demo data
          </CardTitle>
          <CardDescription>Restore all mock records to their seed values.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This clears persisted edits across employees, attendance, payroll, recruitment,
            performance, and settings.
          </p>
          <Button variant="outline" onClick={handleReset} disabled={!canManage}>
            <RotateCcw />
            Reset mock data
          </Button>
          {!canManage ? (
            <p className="text-xs text-muted-foreground">Requires settings management access.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
