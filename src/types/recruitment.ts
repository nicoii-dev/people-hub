import type { ListParams } from "./api";

export type RecruitmentStage =
  | "applied"
  | "screening"
  | "interview"
  | "assessment"
  | "offered"
  | "hired"
  | "rejected";

export interface JobOpening {
  id: string;
  title: string;
  departmentId: string;
  positionId: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  salaryMin: number;
  salaryMax: number;
  status: "open" | "on_hold" | "closed";
  postedAt: string;
  description: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  location: string;
  resumeName: string;
  yearsOfExperience: number;
  appliedAt: string;
  avatarColor: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  stage: RecruitmentStage;
  rating: number | null;
  notes: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  interviewerId: string;
  mode: "Onsite" | "Video call" | "Phone";
  status: "scheduled" | "completed" | "cancelled";
}

export interface ApplicationQueryParams extends ListParams {
  jobId?: string;
  stage?: RecruitmentStage;
}
