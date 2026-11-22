export const ROLES = [
  "super_admin",
  "hr_admin",
  "hr_staff",
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
  "settings:view",
  "settings:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  hr_admin: "HR Administrator",
  hr_staff: "HR Staff",
  department_manager: "Department Manager",
  employee: "Employee",
};

const allPermissions = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: allPermissions,
  hr_admin: allPermissions.filter((permission) => permission !== "settings:manage"),
  hr_staff: [
    "dashboard:view",
    "employees:view",
    "employees:create",
    "employees:edit",
    "attendance:view",
    "attendance:manage",
    "leave:view",
    "leave:create",
    "payroll:view",
    "recruitment:view",
    "performance:view",
    "departments:view",
    "reports:view",
    "reports:export",
    "settings:view",
  ],
  department_manager: [
    "dashboard:view",
    "employees:view",
    "attendance:view",
    "leave:view",
    "leave:approve",
    "payroll:view",
    "performance:view",
    "performance:evaluate",
    "departments:view",
    "reports:view",
  ],
  employee: [
    "dashboard:view",
    "attendance:view",
    "leave:view",
    "leave:create",
    "performance:view",
  ],
};

export function hasPermission(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}
