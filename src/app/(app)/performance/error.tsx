"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PerformanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Performance unavailable"
      description="The performance page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
