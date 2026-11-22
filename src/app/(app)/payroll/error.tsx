"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PayrollError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Payroll unavailable"
      description="The payroll page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
