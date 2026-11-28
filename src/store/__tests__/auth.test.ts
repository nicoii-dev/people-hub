import type { MockUser } from "@/features/auth/types";
import reducer, { hydrateAuth, setSession, setUser } from "../slices/auth";

const staleUser = {
  id: "USER-002",
  firstName: "Josefa",
  lastName: "Torres",
  email: "josefa.torres@peoplehub.ph",
  role: "hr_admin",
  employeeId: "EMP-005",
  title: "HR Manager",
  avatarColor: "#059669",
} as unknown as MockUser;

describe("auth slice role normalization", () => {
  it("normalizes a stale role when hydrating a persisted session", () => {
    const state = reducer(
      undefined,
      hydrateAuth({ user: staleUser, authenticated: true }),
    );

    expect(state.user?.role).toBe("admin");
    expect(state.authenticated).toBe(true);
    expect(state.hydrated).toBe(true);
  });

  it("normalizes stale roles when setting a session or user", () => {
    const sessionState = reducer(
      undefined,
      setSession({ user: staleUser, authenticated: true }),
    );
    const userState = reducer(undefined, setUser(staleUser));

    expect(sessionState.user?.role).toBe("admin");
    expect(userState.user?.role).toBe("admin");
  });

  it("falls back to employee for an unknown persisted role", () => {
    const unknownUser = { ...staleUser, role: "legacy_unknown" } as unknown as MockUser;
    const state = reducer(
      undefined,
      hydrateAuth({ user: unknownUser, authenticated: true }),
    );

    expect(state.user?.role).toBe("employee");
    expect(state.authenticated).toBe(true);
  });
});
