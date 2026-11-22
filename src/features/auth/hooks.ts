"use client";

import { toast } from "sonner";
import type { Permission, Role } from "@/config/permissions";
import { hasPermission } from "@/config/permissions";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSession } from "@/store/slices/auth";
import { authService } from "./mock-auth.service";

export function useAuth() {
  return useAppSelector((state) => state.auth);
}

export function usePermission(permission: Permission) {
  const { user } = useAuth();
  return user ? hasPermission(user.role, permission) : false;
}

export function useAnyPermission(permissions: Permission[]) {
  const { user } = useAuth();
  return user
    ? permissions.some((permission) => hasPermission(user.role, permission))
    : false;
}

export function useRoleSwitcher() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  async function switchRole(role: Role) {
    if (role === user?.role) return;
    const session = await authService.switchRole(role);
    dispatch(setSession(session));
    toast.success(`Switched to ${session.user ? role.replaceAll("_", " ") : "role"}`);
  }

  return { currentRole: user?.role, switchRole };
}

export function useLogout() {
  const dispatch = useAppDispatch();

  async function logout() {
    const session = await authService.logout();
    dispatch(setSession(session));
    toast.success("Signed out of the mock session");
  }

  return { logout };
}
