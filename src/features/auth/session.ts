import { normalizeRole, ROLE_LABELS } from "@/config/permissions";
import type { AuthSession, MockUser } from "./types";

/** Normalizes a possibly stale persisted user before it reaches the UI. */
export function normalizeUser<T extends MockUser>(user: T | null | undefined): T | null {
  if (!user) return null;

  const role = normalizeRole(user.role);
  if (role === user.role) return user;

  return { ...user, role, title: ROLE_LABELS[role] } as T;
}

/** Normalizes a stored session, including legacy role names from older builds. */
export function normalizeSession<T extends AuthSession>(session: T): T {
  const user = normalizeUser(session.user);
  return {
    ...session,
    user,
    authenticated: session.authenticated && user !== null,
  };
}
