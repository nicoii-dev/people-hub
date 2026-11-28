"use client";

import { useQuery } from "@tanstack/react-query";
import { projectReportService } from "@/services/project-report.service";
import type { ProjectReportQuery } from "@/types/project-report";
import { queryKeys } from "./query-keys";

export function useProjectReport(query?: ProjectReportQuery) {
  return useQuery({
    queryKey: queryKeys.projectReportQuery(query),
    queryFn: () => projectReportService.getReport(query),
  });
}
