"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { performanceService } from "@/services/performance.service";
import type { ListParams } from "@/types/api";
import type { ReviewCreateInput } from "@/types/performance";
import { queryKeys } from "./query-keys";

export function usePerformanceReviews(params: ListParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.reviews, params],
    queryFn: () => performanceService.listReviews(params),
  });
}

export function usePerformanceGoals(employeeId?: string) {
  return useQuery({
    queryKey: [...queryKeys.goals, employeeId ?? "all"],
    queryFn: () => performanceService.listGoals(employeeId),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewCreateInput) =>
      performanceService.submitReview(input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
  });
}
