import {
  companyWorkspaceNavigation,
  employeeNavigation,
  findNavItem,
  navigation,
  superAdminNavigation,
} from "../navigation";

describe("employee navigation", () => {
  it("exposes exactly the five self-service pages", () => {
    expect(employeeNavigation.map((item) => item.href)).toEqual([
      "/employee/dashboard",
      "/employee/onboarding",
      "/employee/team",
      "/employee/about",
      "/employee/profile",
    ]);
    expect(employeeNavigation.map((item) => item.permission)).toEqual([
      "employee-home:view",
      "onboarding:view",
      "team-directory:view",
      "company-info:view",
      "my-profile:view",
    ]);
  });

  it("does not add employee pages to the HR navigation", () => {
    const hrefs = navigation.flatMap((item) => [
      item.href,
      ...(item.children ?? []).map((child) => child.href),
    ]);
    expect(hrefs).not.toContain("/employee/dashboard");
  });

  it("resolves employee routes to their specific permission", () => {
    expect(findNavItem("/employee/team")?.permission).toBe("team-directory:view");
    expect(findNavItem("/employee/profile")?.permission).toBe("my-profile:view");
  });

  it("still resolves HR routes with children", () => {
    expect(findNavItem("/dashboard")?.permission).toBe("dashboard:view");
    expect(findNavItem("/employees/EMP-003")?.permission).toBe("employees:view");
  });
});

describe("platform administration navigation", () => {
  it("exposes the super-admin control plane", () => {
    const platform = navigation.find((item) => item.href === "/platform");
    expect(platform?.permission).toBe("platform:view");
    expect(platform?.children?.map((item) => item.href)).toEqual([
      "/platform",
      "/platform/companies",
      "/platform/plans",
      "/platform/payments",
      "/platform/usage",
      "/platform/settings",
    ]);
  });

  it("uses child permissions instead of the parent group permission", () => {
    expect(findNavItem("/platform")?.permission).toBe("platform:view");
    expect(findNavItem("/platform/companies")?.permission).toBe("platform-companies:manage");
    expect(findNavItem("/platform/payments")?.permission).toBe("platform-payments:view");
    expect(findNavItem("/platform/settings")?.permission).toBe("platform-settings:manage");
  });

  it("resolves a company workspace to the manage companies permission", () => {
    expect(findNavItem("/platform/companies/123")?.permission).toBe(
      "platform-companies:manage",
    );
  });
});

describe("role-specific navigation", () => {
  it("gives super admins a flat platform-only sidebar", () => {
    expect(superAdminNavigation.map((item) => item.href)).toEqual([
      "/platform",
      "/platform/companies",
      "/platform/plans",
      "/platform/payments",
      "/platform/usage",
      "/platform/settings",
    ]);
    expect(superAdminNavigation.every((item) => !item.children?.length)).toBe(true);
    expect(
      superAdminNavigation.every((item) => item.permission.startsWith("platform")),
    ).toBe(true);
  });

  it("exposes the HR pages only inside the company workspace", () => {
    expect(companyWorkspaceNavigation.map((item) => item.href)).toContain("/employees");
    expect(companyWorkspaceNavigation.map((item) => item.href)).toContain("/reports");
    expect(companyWorkspaceNavigation.map((item) => item.href)).not.toContain("/platform");
    expect(superAdminNavigation.map((item) => item.href)).not.toContain("/employees");
  });
});
