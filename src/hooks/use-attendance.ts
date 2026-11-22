"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import type { AttendanceAdjustmentInput, AttendanceQueryParams } from "@/types/attendance";
import { queryKeys } from "./query-keys";

export function useAttendance(params: AttendanceQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.attendance, params],
    queryFn: () => attendanceService.list(params),
  });
}

export function useAdjustAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AttendanceAdjustmentInput }) =>
      attendanceService.adjust(id, input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
