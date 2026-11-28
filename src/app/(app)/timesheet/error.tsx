"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function TimesheetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Timesheet unavailable"
      description="The timesheet page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
