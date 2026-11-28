import type { AuthSession } from "@/features/auth/types";

export const TRIAL_FEATURES = [
  "employees",
  "projects",
  "assignments",
  "time-entries",
] as const;

export type TrialFeature = (typeof TRIAL_FEATURES)[number];

export type TrialStatusValue =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED";

export interface TrialStatus {
  active: boolean;
  status: TrialStatusValue;
  plan: string;
  startedAt: string | null;
  endsAt: string | null;
  daysRemaining: number;
  features: TrialFeature[];
  expired: boolean;
}

export const TRIAL_CHECKLIST_KEYS = [
  "add-employee",
  "create-project",
  "assign-employee",
  "submit-time-entry",
] as const;

export type TrialChecklistKey = (typeof TRIAL_CHECKLIST_KEYS)[number];

export type TrialChecklist = Partial<Record<TrialChecklistKey, boolean>>;

export interface TrialState extends TrialStatus {
  companyId: string;
  companyName: string;
  slug: string;
  ownerName?: string;
  ownerEmail?: string;
  checklist: TrialChecklist;
}

export interface RegisterCompanyInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  slug?: string;
  features: TrialFeature[];
}

export interface RegisterCompanyResult {
  session: AuthSession;
  trial: TrialState;
}
