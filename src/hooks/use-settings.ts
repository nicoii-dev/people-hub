"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import type { CompanyProfile, SystemUserUpdateInput } from "@/types/settings";
import { queryKeys } from "./query-keys";

export function useCompanyProfile() {
  return useQuery({
    queryKey: queryKeys.settingsCompany,
    queryFn: () => settingsService.getCompanyProfile(),
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyProfile) =>
      settingsService.updateCompanyProfile(input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settingsCompany });
    },
  });
}

export function useSystemUsers() {
  return useQuery({
    queryKey: queryKeys.settingsUsers,
    queryFn: () => settingsService.listUsers(),
  });
}

export function useUpdateSystemUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SystemUserUpdateInput }) =>
      settingsService.updateUser(id, input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settingsUsers });
    },
  });
}
