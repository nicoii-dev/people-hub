import type { Role } from "@/config/permissions";
import { env } from "@/config/env";
import { apiRequest } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { MOCK_VALUES, mockDelay, readValue, writeValue } from "@/services/mock/persistence";
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
  hr_admin: {
    id: "USER-002",
    firstName: "Josefa",
    lastName: "Torres",
    email: "josefa.torres@peoplehub.ph",
    role: "hr_admin",
    employeeId: "EMP-005",
    title: "HR Manager",
    avatarColor: "#059669",
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
  user: mockUsers.hr_admin,
  authenticated: true,
};

const emptySession: AuthSession = { user: null, authenticated: false };

const mockAuthService: AuthService = {
  async getSession() {
    await mockDelay(60);
    return readValue(MOCK_VALUES.session, defaultSession);
  },
  async login(role) {
    await mockDelay(120);
    const session = { user: mockUsers[role], authenticated: true };
    writeValue(MOCK_VALUES.session, session);
    return session;
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
};

const apiAuthService: AuthService = {
  getSession: () => apiRequest<AuthSession>(API_ENDPOINTS.auth.session).then((response) => response.data),
  login: (role) =>
    apiRequest<AuthSession>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify({ role }),
    }).then((response) => response.data),
  logout: () =>
    apiRequest<AuthSession>(API_ENDPOINTS.auth.logout, { method: "POST" }).then(
      (response) => response.data,
    ),
  switchRole: (role) =>
    apiRequest<AuthSession>(API_ENDPOINTS.auth.switchRole, {
      method: "POST",
      body: JSON.stringify({ role }),
    }).then((response) => response.data),
};

export const authService: AuthService = env.useMockData ? mockAuthService : apiAuthService;
