"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruitmentService } from "@/services/recruitment.service";
import type { ListParams } from "@/types/api";
import type { ApplicationQueryParams, RecruitmentStage } from "@/types/recruitment";
import { queryKeys } from "./query-keys";

export function useJobOpenings() {
  return useQuery({ queryKey: queryKeys.jobs, queryFn: () => recruitmentService.listJobs() });
}

export function useCandidates(params: ListParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.candidates, params],
    queryFn: () => recruitmentService.listCandidates(params),
  });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      applicationId: string;
      scheduledAt: string;
      interviewerId: string;
    }) => recruitmentService.scheduleInterview(input.applicationId, input.scheduledAt, input.interviewerId).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
    },
  });
}
