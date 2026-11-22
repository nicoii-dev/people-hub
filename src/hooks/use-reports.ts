"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import { queryKeys } from "./query-keys";

export function useReports(departmentId?: string) {
  return useQuery({
    queryKey: [...queryKeys.reports, departmentId ?? "all"],
    queryFn: () => reportsService.getReports(departmentId),
  });
}
