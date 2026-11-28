import {
  canReviewAllTimeEntries,
  hasAnyPermission,
  hasPermission,
  normalizeRole,
  ROLES,
  type Role,
} from "../permissions";

describe("role normalization", () => {
  it.each(["hr_admin", "hr_administrator", "company_admin", "HR Admin"])(
    "maps legacy role %s to admin",
    (role) => {
      expect(normalizeRole(role)).toBe("admin");
    },
  );

  it("keeps current role keys unchanged", () => {
    expect(normalizeRole("hr_head")).toBe("hr_head");
    expect(normalizeRole("HR Head")).toBe("hr_head");
    expect(normalizeRole("finance_head")).toBe("finance_head");
    expect(normalizeRole("employee")).toBe("employee");
  });

  it("falls back to the least-privileged role for unknown values", () => {
    expect(normalizeRole("unknown_role")).toBe("employee");
    expect(normalizeRole(null)).toBe("employee");
    expect(normalizeRole(undefined)).toBe("employee");
  });

  it("grants project permissions by role", () => {
    expect(hasPermission("admin", "projects:create")).toBe(true);
    expect(hasPermission("admin", "projects:delete")).toBe(true);
    expect(hasPermission("hr_head", "projects:edit")).toBe(true);
    expect(hasPermission("hr_head", "projects:create")).toBe(false);
    expect(hasPermission("hr_staff", "projects:view")).toBe(true);
    expect(hasPermission("hr_staff", "projects:assign")).toBe(false);
    expect(hasPermission("finance_head", "projects:view")).toBe(true);
    expect(hasPermission("employee", "projects:view")).toBe(true);
    expect(hasPermission("employee", "projects:edit")).toBe(false);
  });

  it("checks permissions safely for stale and unknown roles", () => {
    expect(hasPermission("hr_admin", "clients:view")).toBe(true);
    expect(hasPermission("unknown_role", "clients:view")).toBe(false);
    expect(hasPermission(undefined, "attendance:view")).toBe(true);

    expect(hasAnyPermission("hr_administrator", ["payroll:generate", "clients:create"])).toBe(true);
    expect(hasAnyPermission("unknown_role", ["clients:view", "settings:manage"])).toBe(false);
  });
});

describe("platform administration access", () => {
  const platformPermissions = [
    "platform:view",
    "platform-companies:manage",
    "platform-plans:manage",
    "platform-payments:view",
    "platform-usage:view",
    "platform-settings:manage",
  ] as const;

  it.each(platformPermissions)("restricts %s to the super admin", (permission) => {
    expect(hasPermission("super_admin", permission)).toBe(true);
    expect(hasPermission("admin", permission)).toBe(false);
    expect(hasPermission("hr_head", permission)).toBe(false);
    expect(hasPermission("employee", permission)).toBe(false);
  });
});

describe("employee self-service access", () => {
  const selfServicePermissions = [
    "employee-home:view",
    "onboarding:view",
    "team-directory:view",
    "company-info:view",
    "my-profile:view",
  ] as const;

  it.each(selfServicePermissions)("grants %s to the employee self-service role", (permission) => {
    expect(hasPermission("employee", permission)).toBe(true);
    expect(hasPermission("hr_staff", permission)).toBe(false);
    expect(hasPermission("finance_staff", permission)).toBe(false);
  });
});

describe("payroll access", () => {
  const payrollViewRoles: Role[] = ["admin", "hr_head", "finance_head", "finance_staff"];
  const payrollGenerateRoles: Role[] = ["admin", "hr_head", "finance_head"];

  it.each(ROLES)("limits payroll:view for %s", (role) => {
    expect(hasPermission(role, "payroll:view")).toBe(payrollViewRoles.includes(role));
  });

  it.each(ROLES)("limits payroll:generate for %s", (role) => {
    expect(hasPermission(role, "payroll:generate")).toBe(payrollGenerateRoles.includes(role));
  });
});

describe("report access", () => {
  const readRoles: Role[] = [
    "super_admin",
    "admin",
    "hr_head",
    "hr_staff",
    "finance_head",
    "finance_staff",
    "department_manager",
  ];
  const exportRoles: Role[] = ["super_admin", "admin", "hr_head", "finance_head"];

  it.each(ROLES)("limits reports:view for %s", (role) => {
    expect(hasPermission(role, "reports:view")).toBe(readRoles.includes(role));
  });

  it.each(ROLES)("limits reports:export for %s", (role) => {
    expect(hasPermission(role, "reports:export")).toBe(exportRoles.includes(role));
  });
});

describe("time entry access", () => {
  const viewRoles: Role[] = [...ROLES];
  const createRoles: Role[] = ["super_admin", "admin", "department_manager", "employee"];
  const editRoles: Role[] = [
    "super_admin",
    "admin",
    "hr_head",
    "department_manager",
    "employee",
  ];
  const deleteRoles: Role[] = ["super_admin", "admin", "employee"];

  it.each(ROLES)("grants time-entries:view for %s", (role) => {
    expect(hasPermission(role, "time-entries:view")).toBe(viewRoles.includes(role));
  });

  it.each(ROLES)("limits time-entries:create for %s", (role) => {
    expect(hasPermission(role, "time-entries:create")).toBe(createRoles.includes(role));
  });

  it.each(ROLES)("limits time-entries:edit for %s", (role) => {
    expect(hasPermission(role, "time-entries:edit")).toBe(editRoles.includes(role));
  });

  it.each(ROLES)("limits time-entries:delete for %s", (role) => {
    expect(hasPermission(role, "time-entries:delete")).toBe(deleteRoles.includes(role));
  });

  it("only lets manager and admin roles browse entries across employees", () => {
    expect(canReviewAllTimeEntries("admin")).toBe(true);
    expect(canReviewAllTimeEntries("finance_staff")).toBe(true);
    expect(canReviewAllTimeEntries("department_manager")).toBe(true);
    expect(canReviewAllTimeEntries("employee")).toBe(false);
    expect(canReviewAllTimeEntries("unknown_role")).toBe(false);
  });
});
