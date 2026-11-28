import { resetMockData } from "@/services/mock/persistence";
import { registerCompanySchema } from "../schemas";
import { mockAuthService } from "../mock-auth.service";

const input = {
  email: "owner@example.com",
  password: "Str0ngPassword1",
  firstName: "Mia",
  lastName: "Santos",
  companyName: "Bright Path HR",
  features: ["employees", "projects"] as const,
};

describe("company registration", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("requires a strong password and at least one trial feature", () => {
    expect(registerCompanySchema.safeParse(input).success).toBe(true);
    expect(
      registerCompanySchema.safeParse({ ...input, password: "short" }).success,
    ).toBe(false);
    expect(
      registerCompanySchema.safeParse({ ...input, features: [] }).success,
    ).toBe(false);
  });

  it("creates an admin session and trial in mock mode", async () => {
    const result = await mockAuthService.registerCompany({
      ...input,
      features: [...input.features],
    });

    expect(result.session.authenticated).toBe(true);
    expect(result.session.user?.role).toBe("admin");
    expect(result.session.user?.email).toBe(input.email);
    expect(result.trial.companyName).toBe(input.companyName);
    expect(result.trial.daysRemaining).toBe(14);
    expect(result.trial.features).toEqual(["employees", "projects"]);
  });
});
