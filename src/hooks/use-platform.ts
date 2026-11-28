"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformService } from "@/services/platform.service";
import type {
  CompanyAccountStatus,
  PlatformSettingsInput,
  SubscriptionPlanInput,
} from "@/types/platform";
import { queryKeys } from "./query-keys";

export function usePlatformCompanies() {
  return useQuery({
    queryKey: queryKeys.platformCompanies,
    queryFn: () => platformService.listCompanies(),
  });
}

export function useSetCompanyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: CompanyAccountStatus }) =>
      platformService.setCompanyStatus(input.id, input.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformCompanies });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformRevenue });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformUsage });
    },
  });
}

export function useUpdateCompanyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; planId: string }) =>
      platformService.updateCompanyPlan(input.id, input.planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformCompanies });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformRevenue });
    },
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: queryKeys.platformPlans,
    queryFn: () => platformService.listPlans(),
  });
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.platformPlans });
    void queryClient.invalidateQueries({ queryKey: queryKeys.platformCompanies });
    void queryClient.invalidateQueries({ queryKey: queryKeys.platformRevenue });
  };
}

export function useCreateSubscriptionPlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (input: SubscriptionPlanInput) => platformService.createPlan(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSubscriptionPlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (input: { id: string; values: SubscriptionPlanInput }) =>
      platformService.updatePlan(input.id, input.values),
    onSuccess: invalidate,
  });
}

export function usePlatformPayments() {
  return useQuery({
    queryKey: queryKeys.platformPayments,
    queryFn: () => platformService.listPayments(),
  });
}

export function useRevenueSummary() {
  return useQuery({
    queryKey: queryKeys.platformRevenue,
    queryFn: () => platformService.getRevenueSummary(),
  });
}

export function usePlatformUsage() {
  return useQuery({
    queryKey: queryKeys.platformUsage,
    queryFn: () => platformService.getUsage(),
  });
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: queryKeys.platformSettings,
    queryFn: () => platformService.getSettings(),
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformSettingsInput) => platformService.updateSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformSettings });
    },
  });
}
