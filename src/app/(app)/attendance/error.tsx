"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AttendanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Attendance unavailable"
      description="The attendance page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
