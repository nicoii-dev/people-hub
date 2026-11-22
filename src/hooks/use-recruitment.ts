"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruitmentService } from "@/services/recruitment.service";
import type { ApplicationQueryParams, RecruitmentStage } from "@/types/recruitment";
import { queryKeys } from "./query-keys";

export function useJobOpenings() {
  return useQuery({ queryKey: queryKeys.jobs, queryFn: () => recruitmentService.listJobs() });
}

export function useCandidates() {
  return useQuery({ queryKey: queryKeys.candidates, queryFn: () => recruitmentService.listCandidates() });
}

export function useApplications(params: ApplicationQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.applications, params],
    queryFn: () => recruitmentService.listApplications(params),
  });
}

export function useInterviews() {
  return useQuery({ queryKey: queryKeys.interviews, queryFn: () => recruitmentService.listInterviews() });
}

export function useMoveCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: RecruitmentStage }) =>
      recruitmentService.moveCandidate(id, stage).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applications });
    },
  });
}
