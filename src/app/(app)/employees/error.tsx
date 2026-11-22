"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function EmployeesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Employee directory unavailable"
      description="The directory could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
