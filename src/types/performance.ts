export type ReviewStatus = "draft" | "submitted" | "acknowledged";

export interface KpiScore {
  id: string;
  name: string;
  target: string;
  actual: string;
  score: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  kpis: KpiScore[];
  rating: 1 | 2 | 3 | 4 | 5;
  strengths: string;
  improvements: string;
  managerComments: string;
  status: ReviewStatus;
  submittedAt: string | null;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  dueDate: string;
  progress: number;
  status: "on_track" | "at_risk" | "completed";
}

export interface ReviewCreateInput {
  employeeId: string;
  reviewerId: string;
  period: string;
  kpis: KpiScore[];
  rating: 1 | 2 | 3 | 4 | 5;
  strengths: string;
  improvements: string;
  managerComments: string;
}
