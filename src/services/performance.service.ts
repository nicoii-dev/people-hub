import { env } from "@/config/env";
import { employeeSeed } from "@/data/employees";
import { performanceGoalSeed, performanceReviewSeed } from "@/data/performance";
import { paginate } from "@/lib/pagination";
import { success } from "@/lib/result";
import type { ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  PerformanceGoal,
  PerformanceReview,
  ReviewCreateInput,
} from "@/types/performance";
import {
  fromReviewCreate,
  mapPage,
  toPerformanceGoal,
  toPerformanceReview,
  toReviewQuery,
  type BackendRecord,
} from "./api/adapters";
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
    const search = typeof params.search === "string" ? params.search.trim().toLowerCase() : "";
    const status = typeof params.status === "string" ? params.status : "";
    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    const reviews = readCollection(MOCK_COLLECTIONS.reviews, performanceReviewSeed).filter((review) => {
      if (status && review.status !== status) return false;
      if (!search) return true;
      const employee = employees.find((item) => item.id === review.employeeId);
      const reviewer = employees.find((item) => item.id === review.reviewerId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "";
      const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "";
      return [review.id, review.period, review.status, employeeName, reviewerName]
        .some((value) => value.toLowerCase().includes(search));
    });
    return paginate(reviews, { ...params, search: undefined, limit: params.limit ?? 50 }, "Performance reviews retrieved successfully");
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
  listReviews: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(
        API_ENDPOINTS.reviews(),
        toReviewQuery(params),
      )
      .then((response) => mapPage(response, toPerformanceReview)),
  submitReview: async (input) => {
    const { body, ratings } = fromReviewCreate(input);
    const response = await apiClient.post<BackendRecord>(
      API_ENDPOINTS.reviews(),
      body,
    );
    const reviewId = String(response.data.id ?? "");
    await Promise.all(
      ratings.map((rating) =>
        apiClient.post<BackendRecord>(
          API_ENDPOINTS.reviewRatings(reviewId),
          rating,
        ),
      ),
    );
    return { ...response, data: toPerformanceReview(response.data) };
  },
  listGoals: (employeeId) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.goals(), {
        limit: 100,
        ...(employeeId ? { employeeId } : {}),
      })
      .then((response) => ({
        ...response,
        data: response.data.items.map(toPerformanceGoal),
      })),
};

export const performanceService: PerformanceService = env.useMockData
  ? mockPerformanceService
  : apiPerformanceService;
