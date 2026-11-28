import type { EmployeeDocument } from "./employee";
import type { CompanyProfile } from "./settings";

export type AnnouncementCategory = "company" | "people" | "events" | "policy";

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  category: AnnouncementCategory;
  author: string;
  publishedAt: string;
  pinned?: boolean;
}

export type OnboardingTaskStatus = "completed" | "in_progress" | "pending";

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: OnboardingTaskStatus;
  dueDate: string;
  completedAt?: string;
}

export interface OnboardingSummary {
  employeeId: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  tasks: OnboardingTask[];
  documents: EmployeeDocument[];
}

export interface CompanyPolicy {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  updatedAt: string;
}

export interface HandbookSection {
  id: string;
  title: string;
  summary: string;
  topics: string[];
}

export interface CompanyInformation {
  profile: CompanyProfile;
  policies: CompanyPolicy[];
  handbook: HandbookSection[];
}
