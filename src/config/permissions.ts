export const ROLES = [
  "super_admin",
  "admin",
  "hr_head",
  "hr_staff",
  "finance_head",
  "finance_staff",
  "department_manager",
  "employee",
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "dashboard:view",
  "employees:view",
  "employees:create",
  "employees:edit",
  "employees:archive",
  "attendance:view",
  "attendance:manage",
  "timesheet:view",
  "employee-home:view",
  "onboarding:view",
  "team-directory:view",
  "company-info:view",
  "my-profile:view",
  "leave:view",
  "leave:create",
  "leave:approve",
  "payroll:view",
  "payroll:generate",
  "recruitment:view",
  "recruitment:manage",
  "performance:view",
  "performance:evaluate",
  "departments:view",
  "departments:manage",
  "reports:view",
  "reports:export",
  "clients:view",
  "clients:create",
  "clients:edit",
  "clients:delete",
  "projects:view",
  "projects:create",
  "projects:edit",
  "projects:delete",
  "projects:assign",
  "time-entries:view",
  "time-entries:create",
  "time-entries:edit",
  "time-entries:delete",
  "settings:view",
  "settings:manage",
  "billing:view",
  "platform:view",
  "platform-companies:manage",
  "platform-plans:manage",
  "platform-payments:view",
  "platform-usage:view",
  "platform-settings:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hr_head: "HR Head",
  hr_staff: "HR Staff",
  finance_head: "Finance Head",
  finance_staff: "Finance Staff",
  department_manager: "Department Manager",
  employee: "Employee",
};

const allPermissions = [...PERMISSIONS];
const payrollPermissions = new Set<Permission>(["payroll:view", "payroll:generate"]);
const platformPermissions = new Set<Permission>([
  "platform:view",
  "platform-companies:manage",
  "platform-plans:manage",
  "platform-payments:view",
  "platform-usage:view",
  "platform-settings:manage",
]);
const permissionsWithoutPayroll = allPermissions.filter(
  (permission) => !payrollPermissions.has(permission),
);

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: permissionsWithoutPayroll,
  admin: allPermissions.filter(
    (permission) => permission !== "settings:manage" && !platformPermissions.has(permission),
  ),
  hr_head: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:edit",
    "employees:archive",
    "attendance:view",
    "attendance:manage",
    "timesheet:view",
    "leave:view",
    "leave:create",
    "leave:approve",
    "payroll:view",
    "payroll:generate",
    "recruitment:view",
    "recruitment:manage",
    "performance:view",
    "performance:evaluate",
    "departments:view",
    "departments:manage",
    "projects:view",
    "projects:edit",
    "projects:assign",
    "time-entries:view",
    "time-entries:edit",
    "reports:view",
    "reports:export",
    "settings:view",
  ],
  hr_staff: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:edit",
    "attendance:view",
    "attendance:manage",
    "timesheet:view",
    "leave:view",
    "leave:create",
    "recruitment:view",
    "performance:view",
    "departments:view",
    "projects:view",
    "time-entries:view",
    "reports:view",
    "settings:view",
  ],
  finance_head: [
    "dashboard:view",
    "employees:view",
    "attendance:view",
    "timesheet:view",
    "leave:view",
    "payroll:view",
    "payroll:generate",
    "projects:view",
    "time-entries:view",
    "reports:view",
    "reports:export",
    "settings:view",
    "billing:view",
  ],
  finance_staff: [
    "dashboard:view",
    "attendance:view",
    "timesheet:view",
    "leave:view",
    "payroll:view",
    "projects:view",
    "time-entries:view",
    "reports:view",
  ],
  department_manager: [
    "dashboard:view",
    "employees:view",
    "attendance:view",
    "timesheet:view",
    "leave:view",
    "leave:approve",
    "performance:view",
    "performance:evaluate",
    "departments:view",
    "projects:view",
    "projects:edit",
    "projects:assign",
    "time-entries:view",
    "time-entries:create",
    "time-entries:edit",
    "reports:view",
  ],
  employee: [
    "attendance:view",
    "timesheet:view",
    "employee-home:view",
    "onboarding:view",
    "team-directory:view",
    "company-info:view",
    "my-profile:view",
    "projects:view",
    "time-entries:view",
    "time-entries:create",
    "time-entries:edit",
    "time-entries:delete",
  ],
};

const LEGACY_ROLE_ALIASES: Record<string, Role> = {
  company_admin: "admin",
  hr_administrator: "admin",
  hr_admin: "admin",
  "company admin": "admin",
  "hr administrator": "admin",
  "hr admin": "admin",
  "hr head": "hr_head",
};

/**
 * Normalizes persisted or API-supplied role values to a current frontend role.
 * Unknown roles fall back to the least-privileged role instead of crashing
 * permission checks or granting accidental access.
 */
export function normalizeRole(value: unknown): Role {
  if (typeof value === "string") {
    const key = value.trim().toLowerCase();
    const role = ROLES.find((entry) => entry === key);
    if (role) return role;

    const legacyRole = LEGACY_ROLE_ALIASES[key];
    if (legacyRole) return legacyRole;
  }

  return "employee";
}

/**
 * Roles that may browse time entries across the company. Employees are scoped
 * to their own entries; this mirrors the backend `TIME_ENTRY_MANAGER_ROLES`.
 */
const TIME_ENTRY_REVIEW_ROLES = new Set<Role>([
  "super_admin",
  "admin",
  "hr_head",
  "hr_staff",
  "finance_head",
  "finance_staff",
  "department_manager",
]);

export function canReviewAllTimeEntries(role: unknown): boolean {
  return TIME_ENTRY_REVIEW_ROLES.has(normalizeRole(role));
}

export function hasPermission(role: unknown, permission: Permission) {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

export function hasAnyPermission(role: unknown, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}
