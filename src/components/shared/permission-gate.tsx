"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/config/permissions";
import { useAnyPermission, usePermission } from "@/features/auth/hooks";
import { EmptyState } from "./empty-state";
import { ShieldX } from "lucide-react";

interface PermissionGateProps {
  permission?: Permission;
  anyOf?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, anyOf, children, fallback }: PermissionGateProps) {
  const hasOne = usePermission(permission ?? "dashboard:view");
  const hasAny = useAnyPermission(anyOf ?? []);

  const allowed = anyOf ? hasAny : hasOne;
  if (allowed) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <EmptyState
          icon={<ShieldX className="size-5" />}
          title="Access restricted"
          description="Your current role does not have permission to view this area. Switch roles from the profile menu to preview another role."
        />
      )}
    </>
  );
}
