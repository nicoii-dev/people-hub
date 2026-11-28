import { mockUuid } from "@/data/_common";
import type { Role } from "@/config/permissions";
import { env } from "@/config/env";
import { MOCK_VALUES, mockDelay, readValue, writeValue } from "@/services/mock/persistence";
import { mockTrialState, saveMockTrial } from "@/services/trial.service";
import { apiAuthService } from "./api-auth.service";
import { normalizeSession } from "./session";
import type { AuthService, AuthSession, MockUser } from "./types";

export const mockUsers: Record<Role, MockUser> = {
  super_admin: {
    id: "USER-001",
    firstName: "Amara",
    lastName: "Reyes",
    email: "amara.reyes@peoplehub.ph",
    role: "super_admin",
    employeeId: "EMP-001",
    title: "System Administrator",
    avatarColor: "#2563eb",
  },
  admin: {
    id: "USER-002",
    firstName: "Josefa",
    lastName: "Torres",
    email: "josefa.torres@peoplehub.ph",
    role: "admin",
    employeeId: "EMP-005",
    title: "HR Manager",
    avatarColor: "#059669",
  },
  hr_head: {
    id: "USER-008",
    firstName: "Helen",
    lastName: "Salazar",
    email: "helen.salazar@peoplehub.ph",
    role: "hr_head",
    employeeId: "EMP-025",
    title: "HR Head",
    avatarColor: "#0f766e",
  },
  hr_staff: {
    id: "USER-003",
    firstName: "Mariel",
    lastName: "David",
    email: "mariel.david@peoplehub.ph",
    role: "hr_staff",
    employeeId: "EMP-006",
    title: "HR Specialist",
    avatarColor: "#7c3aed",
  },
  finance_head: {
    id: "USER-006",
    firstName: "Frederick",
    lastName: "Cruz",
    email: "frederick.cruz@peoplehub.ph",
    role: "finance_head",
    employeeId: "EMP-007",
    title: "Finance Manager",
    avatarColor: "#db2777",
  },
  finance_staff: {
    id: "USER-007",
    firstName: "Faye",
    lastName: "Lopez",
    email: "faye.lopez@peoplehub.ph",
    role: "finance_staff",
    employeeId: "EMP-008",
    title: "Finance Analyst",
    avatarColor: "#4f46e5",
  },
  department_manager: {
    id: "USER-004",
    firstName: "Kenji",
    lastName: "Nakamura",
    email: "kenji.nakamura@peoplehub.ph",
    role: "department_manager",
    employeeId: "EMP-002",
    title: "Engineering Manager",
    avatarColor: "#d97706",
  },
  employee: {
    id: "USER-005",
    firstName: "Priya",
    lastName: "Gupta",
    email: "priya.gupta@peoplehub.ph",
    role: "employee",
    employeeId: "EMP-003",
    title: "Software Engineer",
    avatarColor: "#0891b2",
  },
};

export const defaultSession: AuthSession = {
  user: mockUsers.admin,
  authenticated: true,
};

const emptySession: AuthSession = { user: null, authenticated: false };

export const mockAuthService: AuthService = {
  async getSession() {
    await mockDelay(60);
    const stored = readValue<AuthSession>(MOCK_VALUES.session, defaultSession);
    const session = normalizeSession(stored);

    // Migrate sessions persisted before the HR Admin -> Admin role rename so
    // the stale role does not keep coming back on every refresh.
    if (stored.user?.role !== session.user?.role) {
      writeValue(MOCK_VALUES.session, session);
    }

    return session;
  },
  async login(role) {
    await mockDelay(120);
    const session = { user: mockUsers[role], authenticated: true };
    writeValue(MOCK_VALUES.session, session);
    return session;
  },
  async loginWithCredentials() {
    throw new Error("Credential sign-in is only available in API mode.");
  },
  async logout() {
    await mockDelay(80);
    writeValue(MOCK_VALUES.session, emptySession);
    return emptySession;
  },
  async switchRole(role) {
    await mockDelay(100);
    const session = { user: mockUsers[role], authenticated: true };
    writeValue(MOCK_VALUES.session, session);
    return session;
  },
  async registerCompany(input) {
    await mockDelay(350);
    const trial = mockTrialState({
      ...input,
      ownerName: `${input.firstName} ${input.lastName}`.trim(),
    });
    saveMockTrial(trial);
    const session: AuthSession = {
      user: {
        id: mockUuid(),
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        role: "admin",
        employeeId: "",
        title: "Company Administrator",
        avatarColor: "#2563eb",
      },
      authenticated: true,
    };
    writeValue(MOCK_VALUES.session, session);
    return { session, trial };
  },
};

export const authService: AuthService = env.useMockData
  ? mockAuthService
  : apiAuthService;
