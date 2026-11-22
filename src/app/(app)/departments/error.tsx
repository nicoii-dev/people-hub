"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function DepartmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Departments unavailable"
      description="The departments page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
