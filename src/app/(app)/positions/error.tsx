"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PositionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Positions unavailable"
      description="The positions page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
