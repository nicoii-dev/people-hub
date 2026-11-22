"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import type {
  EmployeeCreateInput,
  EmployeeQueryParams,
  EmployeeStatus,
  EmployeeUpdateInput,
} from "@/types/employee";
import { queryKeys } from "./query-keys";

export function useEmployees(params: EmployeeQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.employees, params],
    queryFn: () => employeeService.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: () => employeeService.getById(id),
    enabled: Boolean(id),
  });
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.departments });
  };
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (input: EmployeeCreateInput) =>
      employeeService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeUpdateInput }) =>
      employeeService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useSetEmployeeStatus() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeeService.setStatus(id, status).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useArchiveEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: string) => employeeService.archive(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}
