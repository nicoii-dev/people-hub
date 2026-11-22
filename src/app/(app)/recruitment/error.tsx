"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RecruitmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Recruitment unavailable"
      description="The recruitment page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
