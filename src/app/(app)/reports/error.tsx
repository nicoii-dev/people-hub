"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Reports unavailable"
      description="The reports page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
