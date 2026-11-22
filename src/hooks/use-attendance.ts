"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import type { AttendanceQueryParams } from "@/types/attendance";
import { queryKeys } from "./query-keys";

export function useAttendance(params: AttendanceQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.attendance, params],
    queryFn: () => attendanceService.list(params),
  });
}
