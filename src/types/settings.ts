import type { Role } from "@/config/permissions";

export interface CompanyProfile {
  companyName: string;
  legalName: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export type SystemUserStatus = "active" | "invited" | "suspended";

export interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  employeeId: string;
  role: Role;
  status: SystemUserStatus;
  lastActiveAt: string;
  avatarColor: string;
}

export type SystemUserUpdateInput = Partial<Pick<SystemUser, "role" | "status">>;
