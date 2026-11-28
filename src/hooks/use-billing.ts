"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billing.service";
import type { CheckoutInput } from "@/types/billing";
import { queryKeys } from "./query-keys";

export function useStartCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CheckoutInput) => billingService.startCheckout(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformCompanies });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformPayments });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformRevenue });
    },
  });
}
