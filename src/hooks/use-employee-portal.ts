"use client";

import { useQuery } from "@tanstack/react-query";
import { employeePortalService } from "@/services/employee-portal.service";
import { queryKeys } from "./query-keys";

export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.employeeAnnouncements,
    queryFn: () => employeePortalService.listAnnouncements(),
  });
}

export function useOnboarding(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.employeeOnboarding(employeeId),
    queryFn: () => employeePortalService.getOnboarding(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useCompanyInformation() {
  return useQuery({
    queryKey: queryKeys.employeeCompanyInfo,
    queryFn: () => employeePortalService.getCompanyInformation(),
  });
}
