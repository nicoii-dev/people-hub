"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leave.service";
import type {
  LeaveCreateInput,
  LeaveQueryParams,
  LeaveStatus,
} from "@/types/leave";
import { queryKeys } from "./query-keys";

export function useLeaves(params: LeaveQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.leaves, params],
    queryFn: () => leaveService.list(params),
  });
}

export function useLeaveBalances(employeeId?: string) {
  return useQuery({
    queryKey: [...queryKeys.leaveBalances, employeeId ?? "all"],
    queryFn: () => leaveService.listBalances(employeeId),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: [...queryKeys.leaves, "types"],
    queryFn: () => leaveService.listTypes(),
  });
}

function useInvalidateLeaves() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.leaves });
    void queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalances });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useCreateLeave() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: (input: LeaveCreateInput) =>
      leaveService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateLeaveStatus() {
  const invalidate = useInvalidateLeaves();
  return useMutation({
    mutationFn: ({ id, status, approverId }: { id: string; status: LeaveStatus; approverId?: string }) =>
      leaveService.updateStatus(id, status, approverId).then((response) => response.data),
    onSuccess: invalidate,
  });
}
