"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeEntryService } from "@/services/time-entry.service";
import type {
  TimeEntryCreateInput,
  TimeEntryListParams,
  TimeEntryUpdateInput,
} from "@/types/time-entry";
import { queryKeys } from "./query-keys";

export function useTimeEntries(params?: TimeEntryListParams) {
  return useQuery({
    queryKey: queryKeys.timeEntryList(params),
    queryFn: () => timeEntryService.list(params),
  });
}

export function useTimeEntry(entryId: string) {
  return useQuery({
    queryKey: queryKeys.timeEntry(entryId),
    queryFn: () => timeEntryService.getById(entryId),
    enabled: Boolean(entryId),
  });
}

function useInvalidateTimeEntries() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectReport });
  };
}

export function useCreateTimeEntry() {
  const invalidate = useInvalidateTimeEntries();
  return useMutation({
    mutationFn: (input: TimeEntryCreateInput) =>
      timeEntryService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateTimeEntry() {
  const invalidate = useInvalidateTimeEntries();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TimeEntryUpdateInput }) =>
      timeEntryService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useDeleteTimeEntry() {
  const invalidate = useInvalidateTimeEntries();
  return useMutation({
    mutationFn: (id: string) =>
      timeEntryService.remove(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}
