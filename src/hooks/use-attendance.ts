"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import type {
  AttendanceAdjustmentInput,
  AttendanceQueryParams,
  TimeClockInput,
} from "@/types/attendance";
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

export function useTimeClock(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.timeClock(employeeId),
    queryFn: () => attendanceService.getToday(employeeId),
    enabled: Boolean(employeeId),
  });
}

function useTimeClockMutation(
  action: "timeIn" | "timeOut",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, input }: { employeeId: string; input: TimeClockInput }) =>
      attendanceService[action](employeeId, input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["time-clock"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useTimeIn() {
  return useTimeClockMutation("timeIn");
}

export function useTimeOut() {
  return useTimeClockMutation("timeOut");
}
