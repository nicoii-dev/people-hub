"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function LeaveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Leave Management unavailable"
      description="The leave page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
