"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function TimeEntriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Time entries unavailable"
      description="The time entries page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
