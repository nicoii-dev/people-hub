"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function EmployeeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Employee portal unavailable"
      description="This employee page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
