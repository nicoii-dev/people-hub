import { env } from "@/config/env";
import { performanceGoalSeed, performanceReviewSeed } from "@/data/performance";
import { paginate } from "@/lib/pagination";
import { success } from "@/lib/result";
import type { ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  PerformanceGoal,
  PerformanceReview,
  ReviewCreateInput,
} from "@/types/performance";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface PerformanceService {
  listReviews(params?: ListParams): ServiceResult<Paginated<PerformanceReview>>;
  submitReview(input: ReviewCreateInput): ServiceResult<PerformanceReview>;
  listGoals(employeeId?: string): ServiceResult<PerformanceGoal[]>;
}

const mockPerformanceService: PerformanceService = {
  async listReviews(params = {}) {
    await mockDelay(90);
    return paginate(readCollection(MOCK_COLLECTIONS.reviews, performanceReviewSeed), { ...params, limit: params.limit ?? 50 }, "Performance reviews retrieved successfully");
  },

  async submitReview(input) {
    await mockDelay(180);
    const reviews = readCollection(MOCK_COLLECTIONS.reviews, performanceReviewSeed);
    const nextNumber = Math.max(0, ...reviews.map((item) => Number(item.id.replace("REV-", "")))) + 1;
    const review: PerformanceReview = {
      ...input,
      id: `REV-${String(nextNumber).padStart(3, "0")}`,
      status: "submitted",
      submittedAt: "2026-11-22T15:00:00",
    };
    writeCollection(MOCK_COLLECTIONS.reviews, [...reviews, review]);
    return success(review, "Performance review submitted successfully");
  },

  async listGoals(employeeId) {
    await mockDelay(70);
    const goals = readCollection(MOCK_COLLECTIONS.goals, performanceGoalSeed);
    return success(employeeId ? goals.filter((goal) => goal.employeeId === employeeId) : goals, "Performance goals retrieved successfully");
  },
};

const apiPerformanceService: PerformanceService = {
  listReviews: (params) => apiClient.get<Paginated<PerformanceReview>>(API_ENDPOINTS.reviews, params),
  submitReview: (input) => apiClient.post<PerformanceReview>(API_ENDPOINTS.reviews, input),
  listGoals: (employeeId) =>
    apiClient.get<PerformanceGoal[]>(API_ENDPOINTS.goals, employeeId ? { employeeId } : undefined),
};

export const performanceService: PerformanceService = env.useMockData
  ? mockPerformanceService
  : apiPerformanceService;
