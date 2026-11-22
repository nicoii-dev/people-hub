"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/services/payroll.service";
import type { GeneratePayrollInput, PayrollQueryParams } from "@/types/payroll";
import { queryKeys } from "./query-keys";

export function usePayrollPeriods() {
  return useQuery({
    queryKey: queryKeys.payrollPeriods,
    queryFn: () => payrollService.listPeriods(),
  });
}

export function usePayrollRecords(params: PayrollQueryParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.payrollRecords, params],
    queryFn: () => payrollService.listRecords(params),
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GeneratePayrollInput) =>
      payrollService.generatePreview(input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payrollPeriods });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payrollRecords });
    },
  });
}
