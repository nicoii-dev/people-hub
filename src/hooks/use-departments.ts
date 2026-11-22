"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";
import { positionService } from "@/services/position.service";
import type {
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/types/department";
import type { PositionCreateInput, PositionUpdateInput } from "@/types/position";
import { queryKeys } from "./query-keys";

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => departmentService.list(),
  });
}

export function usePositions() {
  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: () => positionService.list(),
  });
}

function useInvalidateOrganization() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.departments });
    void queryClient.invalidateQueries({ queryKey: queryKeys.positions });
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
  };
}

export function useCreateDepartment() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (input: DepartmentCreateInput) =>
      departmentService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateDepartment() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DepartmentUpdateInput }) =>
      departmentService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useDeleteDepartment() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (id: string) => departmentService.remove(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useCreatePosition() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: (input: PositionCreateInput) =>
      positionService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdatePosition() {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PositionUpdateInput }) =>
      positionService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}
