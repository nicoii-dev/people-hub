"use client";

import { LogOut, Settings, ShieldCheck, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, ROLE_LABELS } from "@/config/permissions";
import { useAuth, useLogout, useRoleSwitcher } from "@/features/auth/hooks";

export function ProfileMenu() {
  const { user } = useAuth();
  const { switchRole } = useRoleSwitcher();
  const { logout } = useLogout();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5" aria-label="User profile menu">
          <EmployeeAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            color={user.avatarColor}
            size="sm"
          />
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold">{user.firstName} {user.lastName}</span>
            <span className="block text-[11px] text-muted-foreground">{ROLE_LABELS[user.role]}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3">
          <EmployeeAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            color={user.avatarColor}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm">{user.firstName} {user.lastName}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Development role switcher
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user.role}
          onValueChange={(value) => {
            const role = ROLES.find((entry) => entry === value);
            if (role) void switchRole(role);
          }}
        >
          {ROLES.map((role) => (
            <DropdownMenuRadioItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={user.role !== "employee"}
          onSelect={() => {
            router.push("/employee/profile");
          }}
        >
          <UserCircle className="size-4" />
          My profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="size-4" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={() => {
            void logout();
          }}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
