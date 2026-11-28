import type { Role } from "@/config/permissions";
import type {
  RegisterCompanyInput,
  RegisterCompanyResult,
} from "@/types/trial";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  employeeId: string;
  title: string;
  avatarColor: string;
}

export interface AuthSession {
  user: MockUser | null;
  authenticated: boolean;
}

export interface AuthService {
  getSession(): Promise<AuthSession>;
  login(role: Role): Promise<AuthSession>;
  loginWithCredentials(email: string, password: string): Promise<AuthSession>;
  logout(): Promise<AuthSession>;
  switchRole(role: Role): Promise<AuthSession>;
  registerCompany(input: RegisterCompanyInput): Promise<RegisterCompanyResult>;
}
