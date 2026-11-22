import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS, ROLES } from "@/config/permissions";
import { SYSTEM_USER_STATUS_OPTIONS } from "@/config/constants";
import { formatDateTime } from "@/lib/utils";
import type { Role } from "@/config/permissions";
import type { SystemUser, SystemUserStatus } from "@/types/settings";

interface SystemUsersTableProps {
  users: SystemUser[];
  canManage: boolean;
  currentUserId?: string;
  onRoleChange: (user: SystemUser, role: Role) => void;
  onStatusChange: (user: SystemUser, status: SystemUserStatus) => void;
}

export function SystemUsersTable({
  users,
  canManage,
  currentUserId,
  onRoleChange,
  onStatusChange,
}: SystemUsersTableProps) {
  const columns: DataTableColumn<SystemUser>[] = [
    {
      id: "user",
      header: "User",
      cellClassName: "min-w-56",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            color={user.avatarColor}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.firstName} {user.lastName}
              {user.id === currentUserId ? (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "title",
      header: "Title",
      cell: (user) => (
        <div>
          <p className="text-sm">{user.title}</p>
          <p className="text-xs text-muted-foreground">{user.employeeId}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => {
        const editable = canManage && user.id !== currentUserId;
        return (
          <Select
            value={user.role}
            disabled={!editable}
            onValueChange={(value) => onRoleChange(user, value as Role)}
          >
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => {
        const editable = canManage && user.id !== currentUserId;
        if (!editable) return <StatusBadge status={user.status} />;
        return (
          <Select
            value={user.status}
            onValueChange={(value) => onStatusChange(user, value as SystemUserStatus)}
          >
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SYSTEM_USER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "lastActive",
      header: "Last active",
      cell: (user) => <span className="text-xs text-muted-foreground">{formatDateTime(user.lastActiveAt)}</span>,
    },
  ];

  return <DataTable columns={columns} data={users} getRowId={(user) => user.id} />;
}
