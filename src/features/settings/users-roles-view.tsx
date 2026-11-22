"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { ROLE_LABELS, ROLES } from "@/config/permissions";
import type { Role } from "@/config/permissions";
import { useAuth, usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSystemUsers, useUpdateSystemUser } from "@/hooks/use-settings";
import type { SystemUser, SystemUserStatus } from "@/types/settings";
import { SystemUsersTable } from "./components/system-users-table";

const EMPTY_USERS: SystemUser[] = [];
const ROLE_FILTER_OPTIONS: FilterOption[] = ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export function UsersRolesView() {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { user: currentUser } = useAuth();
  const canManage = usePermission("settings:manage");
  const usersQuery = useSystemUsers();
  const mutation = useUpdateSystemUser();
  const users = usersQuery.data?.data ?? EMPTY_USERS;

  const filteredUsers = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (!query) return true;
      return `${user.firstName} ${user.lastName} ${user.email} ${user.title} ${user.employeeId}`
        .toLowerCase()
        .includes(query);
    });
  }, [users, roleFilter, debouncedSearch]);

  async function handleRoleChange(user: SystemUser, role: Role) {
    if (role === user.role) return;
    try {
      await mutation.mutateAsync({ id: user.id, input: { role } });
      toast.success(`Role updated to ${ROLE_LABELS[role].toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The role could not be updated.");
    }
  }

  async function handleStatusChange(user: SystemUser, status: SystemUserStatus) {
    if (status === user.status) return;
    try {
      await mutation.mutateAsync({ id: user.id, input: { status } });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The status could not be updated.");
    }
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Users unavailable"
        description="System users could not be loaded."
        error={usersQuery.error}
        onRetry={() => void usersQuery.refetch()}
      />
    );
  }

  if (usersQuery.isPending || !usersQuery.data) {
    return <LoadingSkeleton variant="table" count={6} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-3 border-b p-4 md:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users…" className="w-full" />
        <FilterDropdown
          value={roleFilter}
          onValueChange={setRoleFilter}
          options={ROLE_FILTER_OPTIONS}
          placeholder="Filter by role"
          emptyLabel="All roles"
          className="w-full"
        />
      </div>

      {!canManage ? (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <ShieldAlert className="size-4" />
          Your role has read-only access to users and roles.
        </div>
      ) : null}

      {filteredUsers.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No users found"
            description="Try a different search term or role filter."
            action={
              search || roleFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <SystemUsersTable
          users={filteredUsers}
          canManage={canManage}
          currentUserId={currentUser?.id}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
        />
      )}
    </Card>
  );
}
